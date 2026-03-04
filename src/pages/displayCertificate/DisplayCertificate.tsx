import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useState as useHState } from "@hookstate/core";
import { Box, Flex, VStack, useColorModeValue } from "@chakra-ui/react";
import { jsPDF } from "jspdf";
import PreviewCertificate, { Config, PreviewCertificateType } from "../../components/certificate/PreviewCertificate";
import supabase from "../../configs/Supabase";
import Loading from "../../components/loading/Loading";
import { NotFound } from "../../components/notFound/NotFound";
import loadScript from "../../commonFunctions/loadScript";
import { useOrganizationConfig } from "../../context/OrganizationConfigContext";

import styles from "../../styles/components/certificate.module.css";
import { ElementsType } from "../../components/certificate/DrawingSheet";
import { setWait } from "../../commonFunctions/commonFunctions";

import { CertificateHeader } from "../../components/displayCertificate/CertificateHeader";
import { ActionsCard } from "../../components/displayCertificate/ActionsCard";
import { RecipientCard } from "../../components/displayCertificate/RecipientCard";
import { MetadataGrid } from "../../components/displayCertificate/MetadataGrid";
import { ProgramNameCard } from "../../components/displayCertificate/ProgramNameCard";
import { IssuedByCard } from "../../components/displayCertificate/IssuedByCard";
import { ShareFollowFooter } from "../../components/displayCertificate/ShareFollowFooter";

export interface ImageElementsHolderType {
	[key:string]: HTMLImageElement
}

// Parse date range string like "January 2022 - July 2022" into start/end
const parseDateRange = (dateStr?: string): { startDate?: string; endDate?: string } => {
	if (!dateStr) return {};
	const parts = dateStr.split(" - ");
	return {
		startDate: parts[0]?.trim(),
		endDate: parts[1]?.trim(),
	};
};

// Extract org name and subtitle from "OrgName | Subtitle" format
const parseOrgName = (orgName?: string): { name: string; subtitle?: string } => {
	if (!orgName) return { name: "Unknown Organization" };
	const parts = orgName.split("|");
	return {
		name: parts[0]?.trim() || orgName,
		subtitle: parts[1]?.trim(),
	};
};

export const DisplayCertificate = () => {
	//@ts-ignore
	const { id } = useParams();
	const pageBg = useColorModeValue('gray.50', 'gray.800');
	const cardBg = useColorModeValue('white', 'gray.700');
	const [certificateData, setCertificateData] = useState<any>(null);
	const [isShareThisScriptLoaded, setIsShareThisScriptLoaded] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isExportLoading, setIsExportLoading] = useState(false);
	const [isDownloadImageLoading, setIsDownloadImageLoading] = useState(false);
	const [imageLeftToRender, setImageLeftToRender] = useState(0)
	const [imageElementsHolder, setImageElementsHolder] = useState<ImageElementsHolderType>({})

	const elementsData = useHState<ElementsType | null>(null);
	const configData = useHState<Config | null>(null);

	const previewCertificateRef = useRef<PreviewCertificateType>(null)
	const { getVerificationUrl, config: orgConfig, updateCertificateId } = useOrganizationConfig();

	// Update certificate ID in context when it becomes available (for fallback lookup)
	useEffect(() => {
		if (id) {
			updateCertificateId(id);
		}
	}, [id, updateCertificateId]);

	const fetchData = async () => {
		const { data, error } = await supabase.rpc("get_certificate_data_for_certificate_creation", { certificate_id: id, certificate_short_id: id });

		if (error) {
			console.error('Error fetching certificate data:', error);
			setIsLoading(false);
			return;
		} else if (data && data.length > 0) {
			const certificateData = data[0];
			const templateUrlData = await fetch(
				`${ process.env.REACT_APP_TEMPLATE_URL || 'https://us-central1-gmc-testing.cloudfunctions.net/getTemplateUrlFromTemplateId' }?template_id=${certificateData.template_id}`
			);
			const templateUrlDataJson = await templateUrlData.json();
			setCertificateData({
				...certificateData,
				templateImageUrl: templateUrlDataJson.url.signedURL,
			});
			configData.set(certificateData?.config);
			elementsData.set(certificateData?.elements);

			setIsLoading(false);
		} else if (data && data.length === 0) {
			setIsLoading(false);
			return;
		} else {
			return;
		}
	};

	useEffect(() => {
		fetchData();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [supabase]);

	useEffect(() => {
		if (isLoading === false && isShareThisScriptLoaded === false) {
			loadScript("https://platform-api.sharethis.com/js/sharethis.js#property=5f19e56a8aa12700134b0c27&product=sop")
				.then((script) => {
					setIsShareThisScriptLoaded(true);
				})
				.catch((err: Error) => {
					console.error(err.message);
				});
		}
	}, [isLoading, isShareThisScriptLoaded, setIsShareThisScriptLoaded]);

	const handleDownloadImage = async () => {
		setIsDownloadImageLoading(true)
		let base64Data = previewCertificateRef.current?.getBase64Image()
		if (base64Data) {
			let image = base64Data.replace("image/jpeg", "image/octet-stream");
			var link = document.createElement("a");
			link.download = `${id}.png`;
			link.href = image;
			link.click();
		}
		await setWait(1000);
		setIsDownloadImageLoading(false)
	};

	const handleDownloadPDF = async () => {
		setIsExportLoading(true);
		let base64Data = previewCertificateRef.current?.getBase64Image()
		if (base64Data) {
			let canvasImg = new Image();
			canvasImg.crossOrigin = "Anonymous";
			canvasImg.src = base64Data;
			canvasImg.onload = async () => {
				const doc = new jsPDF({
					unit: "px",
					format: [canvasImg.width, canvasImg.height],
					orientation: canvasImg.height > canvasImg.width ? "portrait" : "landscape",
				});
				doc.addImage(canvasImg, 0, 0, canvasImg.width, canvasImg.height);
				doc.save(`${id}.pdf`);
			};
		}
		await setWait(1000);
		setIsExportLoading(false);
	};

	useEffect(() => {
		if (!certificateData || !orgConfig) return; // Wait for config to be loaded

		let imageObjectsHolder:HTMLImageElement[] = []
		const verificationUrl = getVerificationUrl(certificateData.id);

		Object.keys(elementsData).map((key, index) => {
			if (key === "gmc_link") {
				// @ts-ignore
				elementsData[key]["data"]["text"].set("Verify at " + verificationUrl);
			} else if (key === "gmc_qr") {
				// @ts-ignore
				elementsData[key]["data"]["url"].set(verificationUrl);
			//@ts-ignore
			} else if (key === "certificateId") {
				// @ts-ignore
				elementsData[key]["data"]["text"].set(certificateData.id);
			//@ts-ignore
			} else if (elementsData[key]["type"].get() === "image") {
				// @ts-ignore
				elementsData[key]["data"]["url"].set(certificateData?.extra_metadata[elementsData.get()[key]['header']]);
				imageObjectsHolder[index] = new Image();
				imageObjectsHolder[index].crossOrigin = "Anonymous";
				//@ts-ignore
				imageObjectsHolder[index].src = certificateData?.extra_metadata[elementsData.get()[key]['header']];
				imageObjectsHolder[index].name = key;
				setImageLeftToRender(num => {
					return num + 1
				})
				imageObjectsHolder[index].addEventListener("load", (el:Event) => {
					// @ts-ignore
					elementsData[(el.target as HTMLImageElement).getAttribute('name')]["data"]["url"].set(el.target.getAttribute('src'));
					setImageElementsHolder( vals => {
						return {
							...vals,
							[(el.target as HTMLImageElement).getAttribute('name') as string]: el.target as HTMLImageElement
						}
					})
					setImageLeftToRender(num => {
						return num - 1
					})
				});
			} else {
				// @ts-ignore
				elementsData[key]["data"]["text"].set(certificateData?.extra_metadata[elementsData.get()[key]['header']]);
			}

			return true
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [certificateData, orgConfig, getVerificationUrl]);

	if (isLoading) {
		return <Loading />;
	}

	if (certificateData) {
		const bg = certificateData?.templateImageUrl;
		const isIdCard = certificateData?.extra_metadata['type'] === 'ID-Card';

		let linkedinUrl = new URL('https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME')
		if (certificateData.event_name) {
			linkedinUrl.searchParams.append('name', certificateData.event_name)
		}
		if (certificateData.linkedin_company_id) {
			linkedinUrl.searchParams.append('organizationId', certificateData.linkedin_company_id)
		}
		if (certificateData.event_start_date || certificateData.extra_metadata.date) {
			let eventDate = new Date(certificateData.extra_metadata.date || certificateData.event_start_date)
			linkedinUrl.searchParams.append('issueYear', eventDate.getFullYear().toString())
			linkedinUrl.searchParams.append('issueMonth', eventDate.getMonth().toString())
		}
		if (certificateData.id) {
			linkedinUrl.searchParams.append('certUrl', window.location.href)
		}
		if (certificateData.id) {
			linkedinUrl.searchParams.append('certId', certificateData.id)
		}

		const { name: orgName, subtitle: orgSubtitle } = parseOrgName(certificateData.organization_name);
		const { startDate, endDate } = parseDateRange(certificateData.extra_metadata?.date);

		const handleVerify = () => {
			window.open(
				window.location.href.replace('certificate', 'verification').replace('/c/', '/v/'),
				"_blank"
			);
		};

		return (
			<Box bg={pageBg} minH="100vh">
				{/* Header */}
				<CertificateHeader
					orgName={orgName}
					orgSubtitle={orgSubtitle}
					orgLogoUrl={orgConfig?.logoUrl || certificateData.organization_logo_url}
				/>

				{/* Main content */}
				<Box maxW="1200px" mx="auto" pt="70px" px={{ base: 3, md: 6 }} pb={8}>
					{/* Certificate + Actions row */}
					<Flex
						direction={{ base: "column", lg: "row" }}
						gap={4}
						mb={6}
					>
						{/* Certificate Canvas */}
						<Box
							flex={{ lg: "0 0 65%" }}
							w={{ base: "100%", lg: "65%" }}
							bg={cardBg}
							rounded="lg"
							shadow="base"
							overflow="hidden"
						>
							<div className={styles.board_container}>
								<div className={styles.artboard_container}>
									<div className={styles.artboard} id='preview_certificate'>
										<PreviewCertificate
											ref={previewCertificateRef}
											configData={configData}
											elementsData={elementsData}
											bg={bg}
											imageLeftToRender={imageLeftToRender}
											isWhiteLabeled={certificateData?.is_white_labeled}
											imageElementsHolder={imageElementsHolder}
											orgConfig={orgConfig}
										/>
									</div>
								</div>
							</div>
						</Box>

						{/* Actions Card */}
						<Box flex={{ lg: "0 0 35%" }} w={{ base: "100%", lg: "35%" }}>
							<ActionsCard
								onDownload={handleDownloadImage}
								onDownloadPdf={handleDownloadPDF}
								onLinkedIn={() => window.open(linkedinUrl.toString(), "_blank")}
								onVerify={handleVerify}
								isDownloadLoading={isDownloadImageLoading}
								isPdfLoading={isExportLoading}
								isDisabled={imageLeftToRender !== 0}
								isIdCard={isIdCard}
							/>
						</Box>
					</Flex>

					{/* Info cards stack */}
					<VStack spacing={4} w="100%">
						{certificateData.extra_metadata?.name && (
							<RecipientCard name={certificateData.extra_metadata.name} />
						)}

						<MetadataGrid
							certificateType={certificateData.extra_metadata?.certificateType}
							startDate={startDate}
							endDate={endDate}
							certificateId={certificateData.id}
						/>

						{certificateData.event_name && (
							<ProgramNameCard programName={certificateData.event_name} />
						)}

						<IssuedByCard organizationName={certificateData.organization_name} />

						<ShareFollowFooter
							shareUrl={window.location.href}
							socialLinks={orgConfig?.socialLinks}
						/>
					</VStack>
				</Box>
			</Box>
		);
	}

	return <NotFound />;
};

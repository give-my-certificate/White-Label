import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useState as useHState } from "@hookstate/core";
import { Box, Divider, Flex, Heading, HStack, Img, Text, LinkBox, LinkOverlay, VStack, useColorModeValue, IconButton } from "@chakra-ui/react";
import { Button, Icon, Tooltip } from "@chakra-ui/react";
import { FaDownload, FaFacebook, FaFilePdf, FaImage, FaLinkedin} from "react-icons/fa";
import { jsPDF } from "jspdf";
import PreviewCertificate, { Config, PreviewCertificateType } from "../../components/certificate/PreviewCertificate";
import { Card } from "../../components/card/Card";
import supabase from "../../configs/Supabase";
import Loading from "../../components/loading/Loading";
import { NotFound } from "../../components/notFound/NotFound";
import loadScript from "../../commonFunctions/loadScript";
import { PoweredBy } from "../../components/poweredBy/PoweredBy";
import MindMergeLogSq from '../../assets/images/mindmergesq.png'
import { useOrganizationConfig } from "../../context/OrganizationConfigContext";

import styles from "../../styles/components/certificate.module.css";
import { ElementsType } from "../../components/certificate/DrawingSheet";
import { setWait } from "../../commonFunctions/commonFunctions";

export interface ImageElementsHolderType {
	[key:string]: HTMLImageElement
}

export const DisplayCertificate = () => {
	//@ts-ignore
	const { id } = useParams();
	const textColor = useColorModeValue('gray.600', 'gray.400')
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


		return (
			<div>
				<Flex direction={["column", null, null, "row"]}>
					<Box w={["100%", null, null, "80%"]} maxW={["100%", null, null, "80%"]}>
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
					<Box w={["100%", null, null, "20%"]} maxW={["100%", null, null, "20%"]}>
						<Card>
							<Heading size='md'>Issued By</Heading>
							<Divider mb={4} mt={2} />
							<LinkBox>
								<Flex alignItems="center">
									<Img
										htmlWidth="20px"
										htmlHeight="20px"
										height='20px'
										mr={3}
										objectFit="cover"
										src={orgConfig?.logoUrl || certificateData.organization_logo_url || MindMergeLogSq}
										alt={certificateData.organization_name || "Organization Logo"}
									/>
									<LinkOverlay href={certificateData.organization_website || orgConfig?.headerLinkUrl || '/#'}>
										<Heading size="xs" wordBreak="break-all">
											{certificateData.organization_name}
										</Heading>
									</LinkOverlay>
								</Flex>
							</LinkBox>

							<Heading size='md' mt={6}>Actions</Heading>
							<Divider mb={4} mt={2} />
							<Heading size='sm' mb={3}>
								Download
							</Heading>
							<VStack alignItems="flex-start">
								<Tooltip label='Download Certificate as Image' aria-label='Download Certificate'>
									<Button 
										rightIcon={<FaDownload />} 
										colorScheme='blue' 
										variant='outline' 
										onClick={handleDownloadImage}
										isLoading={isDownloadImageLoading}
										loadingText='Loading...'
										isDisabled={(imageLeftToRender !== 0)}
									>
										As Image <Icon as={FaImage} ml={2} />
									</Button>
								</Tooltip>
								<Tooltip label='Download Certificate as pdf' aria-label='Download Certificate as pdf'>
									<Button
										rightIcon={<FaDownload />}
										colorScheme='red'
										variant='outline'
										onClick={handleDownloadPDF}
										isLoading={isExportLoading}
										loadingText='Loading...'
										isDisabled={(imageLeftToRender !== 0)}
									>
										As Pdf <Icon as={FaFilePdf} ml={2} />
									</Button>
								</Tooltip>
								{/* {	(certificateData?.extra_metadata['type'] !== 'ID-Card' ) &&
									(
									<Tooltip label='Verify your Certificate' aria-label='Verify your Certificate'>
										<Button
											rightIcon={<FaCheckCircle />}
											colorScheme='green'
											variant='outline'
											onClick={() => window.open(window.location.href.replace('certificate', 'verification').replace('/c/', '/v/'), "_blank")}
										>
											Verify
										</Button>
									</Tooltip>
									)
								} */}
								{	(certificateData?.extra_metadata['type'] !== 'ID-Card' ) &&
									(
									<Tooltip label='Add your certificate to linked in' aria-label='Download Certificate as pdf'>
										<Button
											rightIcon={<FaLinkedin />}
											colorScheme='linkedin'
											variant='solid'
											onClick={() => window.open(linkedinUrl.toString(), "_blank")}
										>
											Add to linkedIn
										</Button>
									</Tooltip>
									)
								}
							</VStack>
							<Divider mb={4} mt={8} />
							<Heading size='sm' mb={3}>
								Share
							</Heading>
							<HStack justifyContent='center'>
								<div className='sharethis-inline-share-buttons' />
							</HStack>
							<Divider mb={4} mt={8} />
							<Flex justifyContent="center" mb="3">
								<Text color={textColor}>
									Follow us at
								</Text>
							</Flex>
							<Flex justifyContent="center">
								<HStack>
									{orgConfig?.socialLinks?.facebook && (
										<Tooltip label="Follow on facebook" aria-label="Follow on facebook">
											<IconButton 
												aria-label="Follow on facebook"
												icon={<FaFacebook />}
												colorScheme="facebook"
												onClick={() => window.open(orgConfig.socialLinks.facebook, "_blank")}
											/>
										</Tooltip>
									)}
									{orgConfig?.socialLinks?.linkedin && (
										<Tooltip label="Follow on Linked In" aria-label="Follow on Linked In">
											<IconButton 
												aria-label="Follow on Linked In"
												icon={<FaLinkedin />}
												colorScheme="linkedin"
												onClick={() => window.open(orgConfig.socialLinks.linkedin, "_blank")}
											/>
										</Tooltip>
									)}
									{/* <Tooltip label="Follow on Instagram" aria-label="Follow on Instagram">
										<IconButton 
											aria-label="Follow on Instagram"
											icon={<FaInstagram />}
											colorScheme="orange"
											onClick={() => window.open('https://instagram.com/upgrad_edu?igshid=YmMyMTA2M2Y=', "_blank")}
										/>
									</Tooltip> */}
								</HStack>
							</Flex>
							<PoweredBy forcedColumnLayout={true} />
						</Card>
					</Box>
				</Flex>
			</div>
		);
	}

	return <NotFound />;
};

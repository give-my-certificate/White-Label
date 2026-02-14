import moment from "moment"

export const DEFAULT_NOTIFICATION_DISPLAY_TIME = 9000
export const todayMoment = moment()
export const DISPLAY_PROFILE_IMAGE_CHANGE_ON_HEADER = true
export const PHONE_REG_EXP = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/
export const EMAIL_REG_EXP = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const DEFAULT_PAGE_NO = 1
export const DEFAULT_PAGE_SIZE = 2
export const DEFAULT_SORT_ORDER = 'descending'

//Error Messages
export const USER_NOT_EXIST = 'User does not exist'
export const NO_USER_WITH_EMAIL = 'A user with the provided e-mail does not exist'
export const USER_ERROR_NOT_ALLOWED = 'Action Not allowed'
export const FORGOT_PASSWORD_NOT_ALLOWED_FOR_SOME_TIME = 'You can only send one email every minute, Try in some time'
export const USER_ERROR_INVALID_AUTH_TITLE = 'Invalid email or password'
export const USER_ERROR_INVALID_AUTH_MESSAGE = 'A user with provided email and password does not exist.'
export const DEFAULT_USER_ERROR_TITLE = 'Some error occured'
export const DEFAULT_USER_ERROR_MESSAGE = 'Sit back and relex while we fix this issue'
export const GENERIC_ERROR_TITLE = 'Looks like an error'
export const USER_NOT_LOGGED_IN_TITLE = 'Not logged in'
export const USER_NOT_LOGGED_IN_CHANGE_PASSWORD_MESSAGE = 'Sorry we can\'t change your password as you are not logged in, Please use forgot password.'

export const NOT_IMAGE_TITLE = "Not an image"
export const NOT_IMAGE_MESSAGE = "The file you selected is not an image file. Please use only images"
export const IMAGE_TOO_LARGE_TITLE = "Image too large"
export const IMAGE_TOO_LARGE_MESSAGE = "Sorry, At this moment we do not support images which are larger than 2 MB"

export const ORGANIZATION_MAX_ESTABLISHMENT_DATE_MESSAGE = "Sorry, But we live in present, So should you"
export const ORGANIZATION_MIN_ESTABLISHMENT_DATE_MESSAGE = "Are you sure?"

//Success Messages
export const USER_MAGIC_LINK_TITLE = "Confirmation mail sent"
export const USER_MAGIC_LINK_MESSAGE = "Just click on the link, We've send on your email address and Houdini will log you in magically"

export const DEFAULT_EMAIL_TEMPLATE = `
<p>Greetings {{name}},</p>
<p>&nbsp;</p>
<p>Thank You so much for your Participation in <strong>{{event.name}} by {{organization.name}}</strong>.<br /><br />Below we have attached your Certificate.<br /><br />Share your certificates on social media handles <strong>{{event.hashtags}}</strong></p>
<p><br />Digital certificate save our trees and our environment. Say Hello to&nbsp;<strong>Give My Certificate.</strong><br /><br />We would like to assure you that your data is safe with us and is used for one reason alone: Verification of your Documents. We do not and will never share your data with anyone.<br />You can Verify your certificate at {{verification_link}}</p>
<p><br />Regards</p>
<p>{{organization.name}}</p>
`

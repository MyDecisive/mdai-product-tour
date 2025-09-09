import { css, type CSSObject } from "@emotion/react";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  TextField,
  Stack,
  Typography,
  Alert,
  Link
} from "@mui/material";
import { MuiTelInput } from 'mui-tel-input'
import { isValidPhoneNumber, parsePhoneNumberFromString } from 'libphonenumber-js';
import { useCallback, useState, useEffect } from "react";
import { contactAPIEndpoint, contactUrl } from "../../utils/constants";
import contactFormContent from "../../utils/contactForm.yml";

type FormValues = {
  email: string;
  name?: string;
  phone?: string;
  contactReasons?: string[];
  questions?: string;
};

export type DefaultValues = Partial<FormValues>;

type ContactFormProps = {
  handleClose: () => void;
  styles?: CSSObject;
  defaultValues?: DefaultValues;
};

const emailRegex =
  // eslint-disable-next-line no-control-regex
  /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

const textFieldStyles = css({
  marginBottom: "16px",
  width: "100%",
});

const buttonStyles = css({
  width: "100%",
  marginTop: "12px",
  textTransform: "none",
  borderRadius: "4px",
});

const makeFallbackMailtoLink = (values: FormValues) =>
  `${contactUrl}?subject=${
    contactFormContent.emailSubject
  }&body=${encodeURIComponent(makeEmailBody(values))}`;

const makeEmailBody = (values: FormValues) =>
  Object.entries(values).reduce((emailString, [field, value]) => {
    if (field === "contactReasons" && (value as string[]).length) {
      return emailString.replace(
        "%contactReasons%",
        "* " + (value as string[]).join(" & * ")
      );
    } else {
      return emailString.replaceAll(`%${field}%`, value as string);
    }
  }, contactFormContent.emailBodyTemplate);

export const sendContactForm = async (values: FormValues) => {
  const response = await fetch(contactAPIEndpoint, {
    mode: "cors",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });
  if (!response.ok) {
    throw `Error occurred sending contact form. Response: ${response}`;
  }
  return response;
};

export function ContactForm({ handleClose, styles, defaultValues }: ContactFormProps) {
  const [email, setEmail] = useState<string>(defaultValues?.email ?? "");
  const [name, setName] = useState<string>(defaultValues?.name ?? "");
  const [phone, setPhone] = useState<string>(defaultValues?.phone ?? "");
  const initialLicensing = !!defaultValues?.contactReasons?.includes("Licensing");
  const initialHelp = !!defaultValues?.contactReasons?.includes("Help");
  const [licensing, setLicensing] = useState<boolean>(initialLicensing);
  const [help, setHelp] = useState<boolean>(initialHelp);
  const [questions, setQuestions] = useState<string>(defaultValues?.questions ?? "");
  const [showValidationIssues, setShowValidationIssues] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isErrored, setIsErrored] = useState(false);
  const disabled = isSending || isSuccess || !(name.trim() && email.trim());
  const emailIsValid = (v: string) => !!v && emailRegex.test(v);
  const phoneIsValid = (v: string) => !v || isValidPhoneNumber(v);

  
  const resetForm = useCallback(() => {
    setName(defaultValues?.name ?? "");
    setEmail(defaultValues?.email ?? "");
    setPhone(defaultValues?.phone ?? "");
    setQuestions(defaultValues?.questions ?? "");
    setLicensing(!!defaultValues?.contactReasons?.includes("Licensing"));
    setHelp(!!defaultValues?.contactReasons?.includes("Help"));
    setShowValidationIssues(false);
  }, [defaultValues]);

  useEffect(() => {
    setIsSending(false);
    setIsErrored(false);
    setIsSuccess(false);
    resetForm();
  }, [resetForm]);

  const validate = () => {
    const valid = emailIsValid(email) && phoneIsValid(phone);
    setShowValidationIssues(!valid);
    return valid;
  };

  const onClickSubmit = async () => {
    const contactReasons: string[] = [];

    if (!validate()) {
      return;
    }
    if (licensing) contactReasons.push("I'm interested in using MDAI");
    if (help) contactReasons.push("Help me set it up");

    const normalizedPhone = phone
      ? (parsePhoneNumberFromString(phone)?.number ?? phone)
      : undefined;

    const values = {
      name,
      email,
      phone: normalizedPhone,
      questions,
      contactReasons,
    } as FormValues;

    setIsSending(true);
    setIsErrored(false);
    try {
      await sendContactForm(values);
      setIsSuccess(true);
      resetForm();
      setTimeout(handleClose, 5000);
    } catch (error) {
      console.log(error);
      setIsErrored(true);
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <Box
      sx={css([
        {
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          minWidth: "520px",
        },
        styles,
      ])}
    >
      <Typography sx={{ fontWeight: 700, fontSize: "24px", mb: "24px" }}>
        Have questions or feedback?
      </Typography>

      <TextField
        sx={textFieldStyles}
        name="email"
        label="Email Address"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={showValidationIssues && !emailIsValid(email)}
      />
      {showValidationIssues && !email && (
        <Typography sx={{ color: "error.main", mt: -1, mb: 1 }}>
          Please enter your email address.
        </Typography>
      )}
      {showValidationIssues && !!email && !emailRegex.test(email) && (
        <Typography sx={{ color: "error.main", mt: -1, mb: 1 }}>
          Please enter a valid email address.
        </Typography>
      )}
      <TextField
        sx={textFieldStyles}
        name="name"
        label="Full Name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <MuiTelInput
        sx={textFieldStyles}
        name="phone"
        defaultCountry="US"
        label="Phone Number"
        forceCallingCode
        value={phone}
        error={showValidationIssues && !!phone && !phoneIsValid(phone)}
        onChange={(value) => {
          setPhone(value);
          if (showValidationIssues) {
            if (!value || phoneIsValid(value)) {
              setShowValidationIssues(false);
            }
          }
        }}
      />
      {showValidationIssues && !!phone && !phoneIsValid(phone) && (
        <Typography sx={{ color: 'error.main', mt: -1, mb: 1 }}>
          Please enter a valid phone number.
        </Typography>
      )}
      <Typography sx={{ fontWeight: 700, mt: "16px" }}>
        Reason for Contact
      </Typography>
      <FormControl fullWidth>
        <FormControlLabel
          control={<Checkbox />}
          labelPlacement="end"
          label={
            <Stack direction="row" gap="0.5em">
              <Typography>I am interested in using MDAI</Typography>
              <Typography sx={{ color: "#6E6E6E" }}>
                (Licensing and using the software)
              </Typography>
            </Stack>
          }
          checked={licensing}
          onChange={(_, checked) => setLicensing(checked)}
          disableTypography
        />
        <FormControlLabel
          control={<Checkbox />}
          labelPlacement="end"
          label={
            <Stack direction="row" gap="0.5em">
              <Typography>Help me set it up</Typography>
              <Typography sx={{ color: "#6E6E6E" }}>
                (Technical team will contact you)
              </Typography>
            </Stack>
          }
          checked={help}
          onChange={(_, checked) => setHelp(checked)}
          disableTypography
        />
      </FormControl>
      <Typography sx={{ mt: "40px", mb: "8px" }}>
        I have questions about the product
      </Typography>
      <TextField
        sx={{ width: "100%" }}
        name="questions"
        variant="outlined"
        multiline
        minRows={4}
        maxRows={8}
        placeholder="Type question here"
        value={questions}
        onChange={(e) => setQuestions(e.target.value)}
      />
      {isErrored && (
              <Alert severity="error" sx={{ mt: "12px" }}>
                {contactFormContent.emailErrorPrefix}
                <br />
                <Link
                  href={makeFallbackMailtoLink({
                    name,
                    email,
                    phone,
                    contactReasons: [
                      ...(licensing ? ["Licensing"] : []),
                      ...(help ? ["Help"] : []),
                    ],
                    questions,
                  })}
                >
                  {contactFormContent.emailErrorLinkLabel}
                </Link>{" "}
                {contactFormContent.emailErrorSuffix}
              </Alert>
            )}
      {isSuccess && (
        <Alert severity="success" sx={{ mt: 2, width: "100%" }}>
          Thanks! Your message has been sent.
        </Alert>
      )}

      <Button
        sx={buttonStyles}
        size="medium"
        onClick={onClickSubmit}
        variant="contained"
        disabled={disabled}
      >
        {isSending ? "Sending..." : isSuccess ? "Sent" : "Submit"}
      </Button>
      <Button
        sx={buttonStyles}
        size="medium"
        onClick={handleClose}
        variant="outlined"
        href="https://mydecisivecommunity.slack.com/archives/C08LE3DJ877"
        target="_blank"
        rel="noreferrer"
      >
        Join our Slack
      </Button>
    </Box>
  );
}

import { css, type CSSObject } from "@emotion/react";
import {
  Alert,
  Box,
  Button,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useCallback, useMemo } from "react";
import {
  contactAPIEndpoint,
  contactUrl,
  emailRegex,
} from "../../utils/constants";
import formContent from "../../utils/contactForm.yml";
import type { ContactFormContent } from "../../utils/types";

const contactFormContent = formContent as ContactFormContent;

interface FormValues {
  email: string;
}

export type DefaultValues = Partial<FormValues>;

interface Props {
  handleClose: () => void;
  defaultValues?: DefaultValues;
  styles?: CSSObject;
}

const makeFallbackMailtoLink = (values: FormValues) =>
  `${contactUrl}?subject=${
    contactFormContent.emailSubject
  }&body=${encodeURIComponent(makeEmailBody(values))}`;

const makeEmailBody = (values: FormValues) =>
  Object.entries(values).reduce(
    (emailString: string, [field, value]: [string, string[] | string]) => {
      return emailString.replaceAll(`%${field}%`, value as string);
    },
    contactFormContent.emailBodyTemplate
  );

export const sendContactForm = async (values: FormValues) => {
  if (!contactAPIEndpoint) {
    throw new Error("Missing contact form submission endpoint!");
  }
  const payload = {
    ...values,
    sourceUrl: window.location.toString(),
  };
  const response = await fetch(contactAPIEndpoint, {
    mode: "cors",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(
      `Error occurred sending contact form. Response: ${JSON.stringify(
        response,
        null,
        2
      )}`
    );
  }
  return response;
};

export const ContactForm = ({ styles, handleClose, defaultValues }: Props) => {
  const emailRef = React.useRef<HTMLInputElement | null>(null);
  const [showValidationIssues, setShowValidationIssues] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [isErrored, setIsErrored] = React.useState(false);
  const [email, setEmail] = React.useState(defaultValues?.email ?? "");

  const resetForm = useCallback(() => {
    setEmail(defaultValues?.email ?? "");
    if (emailRef.current) {
      emailRef.current.value = "";
    }
    setShowValidationIssues(false);
  }, [defaultValues]);

  React.useEffect(() => {
    setIsSending(false);
    setIsErrored(false);
    setIsSuccess(false);
    resetForm();
  }, [resetForm]);

  const validate = () => {
    const valid = !!email && emailRegex.test(email);
    setShowValidationIssues(!valid);
    return valid;
  };

  const onClickSubmit = () => {
    if (!validate()) {
      return;
    }

    setIsSending(true);
    setIsErrored(false);

    const values = {
      email,
    };
    void sendContactForm(values)
      .then(() => {
        setIsSuccess(true);
        resetForm();
        setTimeout(handleClose, 5000);
      })
      .catch((error) => {
        console.log(error);
        setIsErrored(true);
      })
      .finally(() => {
        setIsSending(false);
      });
  };

  const emailFieldHelperText = useMemo(() => {
    if (showValidationIssues) {
      if (!email) {
        return contactFormContent.emailRequiredMessage;
      }
      if (!emailRegex.test(email)) {
        return contactFormContent.emailInvalidMessage;
      }
    }

    return "";
  }, [showValidationIssues, email]);

  return (
    <Box
      className="contact-form-content"
      sx={css([
        // {
        //   position: "absolute",
        //   top: "50%",
        //   left: "50%",
        //   transform: "translate(-50%, -50%)",
        //   width: { sm: "90%", md: 600 },
        //   boxShadow: 24,
        //   p: 4,
        // },
        {
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          width: "600px",
        },
        styles,
      ])}
    >
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between">
          <div style={{ width: 48 }} />
        </Stack>
        <Typography variant="h6">{contactFormContent.topCopy}</Typography>
        <TextField
          required
          variant="filled"
          type="email"
          inputRef={emailRef}
          label={contactFormContent.emailLabel}
          onChange={(e) => {
            setEmail(e.currentTarget.value);
          }}
          error={showValidationIssues && !emailRegex.test(email)}
          helperText={emailFieldHelperText}
        />
        <Typography>
          <span>
            By clicking the "Submit" button below, you agree to MyDecisive's{" "}
          </span>
          <a href="terms" rel="noopener noreferrer" target="_blank">
            Terms of Use
          </a>
          <span> and acknowledge our </span>
          <a href="privacy-policy" rel="noopener noreferrer" target="_blank">
            Privacy Policy
          </a>
          .
        </Typography>
        {isErrored && (
          <Alert severity="error">
            {contactFormContent.emailErrorPrefix}
            <br />
            <Link
              href={makeFallbackMailtoLink({
                email,
              })}
            >
              {contactFormContent.emailErrorLinkLabel}
            </Link>{" "}
            {contactFormContent.emailErrorSuffix}
          </Alert>
        )}
        {isSuccess && (
          <Alert severity="success">{contactFormContent.emailSuccess}</Alert>
        )}
        <Stack direction="row" justifyContent="right" spacing={2}>
          <Button
            disabled={isSending}
            variant="text"
            size="medium"
            onClick={handleClose}
            sx={{ color: "#ffffff !important" }}
          >
            {contactFormContent.cancelButtonLabel}
          </Button>
          <Button
            disabled={isSending || isSuccess}
            variant="contained"
            loading={isSending}
            size="medium"
            onClick={onClickSubmit}
          >
            {contactFormContent.submitButtonLabel}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

import { css } from "@emotion/react";
import {
  Checkbox,
  FilledInput,
  FormControl,
  FormControlLabel,
  OutlinedInput,
  Stack,
} from "@mui/material";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import type { FullScreenModalContentProps } from "../../utils/types";

const textFieldStyles = css({
  marginBottom: "16px",
  width: "70%",
});

const buttonStyles = css({
  width: "100%",
  marginTop: "12px",
  textTransform: "none",
  borderRadius: "4px",
});

export function ContactForm({ handleClose }: FullScreenModalContentProps) {
  const [email, setEmail] = useState<string>();
  const [name, setName] = useState<string>();
  const [phone, setPhone] = useState<string>();
  const [licensing, setLicensing] = useState<boolean>(false);
  const [help, setHelp] = useState<boolean>(false);
  const [questions, setQuestions] = useState<string>();
  return (
    <Paper
      sx={{
        paddingX: "48px",
        paddingY: "40px",
        backgroundColor: "#272727",
        color: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: "24px", mb: "24px" }}>
        Have questions or feedback?
      </Typography>

      <OutlinedInput
        sx={textFieldStyles}
        placeholder="Email Address*"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <OutlinedInput
        sx={textFieldStyles}
        placeholder="Full Name*"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <OutlinedInput
        sx={textFieldStyles}
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
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
      <FilledInput
        sx={{ width: "100%" }}
        multiline
        minRows={4}
        maxRows={8}
        placeholder="Type question here"
        value={questions}
        onChange={(e) => setQuestions(e.target.value)}
      />

      <Button
        sx={buttonStyles}
        size="medium"
        onClick={handleClose}
        variant="contained"
      >
        Submit
      </Button>
      <Button
        sx={buttonStyles}
        size="medium"
        onClick={handleClose}
        variant="outlined"
      >
        Join our Slack
      </Button>
    </Paper>
  );
}

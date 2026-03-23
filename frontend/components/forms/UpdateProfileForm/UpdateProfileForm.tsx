import { Button } from "@mui/material";

export default function UpdateProfileForm() {
  return (
    <form>
      <input type="text" placeholder="Name" />
      <input type="email" placeholder="Email" />
      <Button variant="contained" color="primary" type="submit">
        Update Profile
      </Button>
    </form>
  );
}

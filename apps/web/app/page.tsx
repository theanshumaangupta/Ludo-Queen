import Home from "../Components/Home";
import Nav from "../Components/Nav";
import AuthProtected from "./AuthProtected";
export default function Page() {
  return (
    <AuthProtected>
      <Nav/>
      <Home />
    </AuthProtected>
  );
}

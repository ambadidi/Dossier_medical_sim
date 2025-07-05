import React from "react";
import Loader from "../components/Loader";
import Message from "../components/Message";
import MyNavbarAdmin from "../components/MyNavbarAdmin";

function AdminScreen() {
  return (
    <>
      <header>
        <MyNavbarAdmin />
      </header>

      <div>
        <h1>Admin Screen</h1>
      </div>
    </>
  );
}

export default AdminScreen;

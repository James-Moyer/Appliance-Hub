import { Slot } from 'expo-router';
import { useState } from 'react';
import { SessionContext } from "../helpers/sessionContext";

export default function Layout() {

    const [sessionContext, setContext] = useState({
        IsLoggedIn : "false",
        UID : "",
        email: "",
        token : "",
    });

  return (
    <SessionContext.Provider value = {{ sessionContext, setContext }}>
      <Slot />
    </SessionContext.Provider>
  );
}

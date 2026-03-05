import React from "react";
import Sidebar from "./Sidebar";

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#080808]">
      <Sidebar />
      <main className="flex-1 ml-[220px] min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
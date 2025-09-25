import React, { createContext, useContext } from "react";
import { useCustomers as useCustomersHook } from "../database/useCustomers";

const CustomersContext = createContext();

export const CustomersProvider = ({ children }) => {
  const customersData = useCustomersHook();
  return (
    <CustomersContext.Provider value={customersData}>
      {children}
    </CustomersContext.Provider>
  );
};

export const useCustomers = () => useContext(CustomersContext);

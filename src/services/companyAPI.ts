import api from "./api";

// Define what a Company looks like
export interface Company {
  id: string;
  name: string;
  industry: string;
  currency: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  phone?: string;
  website?: string;
  taxId?: string;
  fiscalYearStart?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyData {
  name: string;
  industry: string;
  currency?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  phone?: string;
  website?: string;
}

// Company API calls
export const companyAPI = {
  // Get all companies for the logged-in user
  getCompanies: async (): Promise<{
    success: boolean;
    companies: Company[];
  }> => {
    const response = await api.get("/companies");
    return response.data;
  },

  // Create a new company
  createCompany: async (
    companyData: CreateCompanyData
  ): Promise<{
    success: boolean;
    message: string;
    company: Company;
  }> => {
    const response = await api.post("/companies", companyData);
    return response.data;
  },

  //Update an existing company
  updateCompany: async (
    id: string,
    companyData: Partial<CreateCompanyData>
  ): Promise<{
    success: boolean;
    message: string;
    company: Company;
  }> => {
    const response = await api.put(`/companies/${id}`, companyData);
    return response.data;
  },

  //Delete a company
  deleteCompany: async (
    id: string
  ): Promise<{
    success: boolean;
    message: string;
  }> => {
    const response = await api.delete(`/companies/${id}`);
    return response.data;
  },
};

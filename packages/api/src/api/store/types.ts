export interface Organization {
	name: string;
	companyID: string;
	companyTaxID: string;
	companyVatID: string;
	isVatPayer: boolean;
}

export interface Store {
	uid: string | null;
	name: string;
	unitType: string;
	streetAddress: string;
	city: string;
	postalCode: string;
	country: string;
	organization: Organization;
}
import type { Database } from '../database.types';
type OrganizationRow = Database['public']['Tables']['organizations']['Row'];
export declare function getOrganization(userId: string): Promise<OrganizationRow | null>;
export declare function updateOrganization(orgId: string, updates: Partial<OrganizationRow>): Promise<OrganizationRow>;
export declare function createOrganization(organizationData: {
    owner_user_id: string;
    org_name: string;
    org_type: Database['public']['Enums']['org_type'];
    description?: string;
    website_url?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
}): Promise<OrganizationRow>;
export {};

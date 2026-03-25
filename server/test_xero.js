import dotenv from 'dotenv';
import { XeroClient } from 'xero-node';
dotenv.config();

const client_id = process.env.XERO_CLIENT_ID;
const client_secret = process.env.XERO_CLIENT_SECRET;
const scopes = 'accounting.transactions accounting.settings.read accounting.contacts accounting.reports.read';

const xero = new XeroClient({
    clientId: client_id,
    clientSecret: client_secret,
    grantType: 'client_credentials',
    scopes: scopes.split(' ')
});

async function test() {
    try {
        const tokenSet = await xero.getClientCredentialsToken();
        console.log("Token received:", tokenSet.access_token ? "Yes" : "No");
        
        await xero.updateTenants();
        console.log("Tenants:", xero.tenants);
        
        if (xero.tenants && xero.tenants.length > 0) {
            const tenantId = xero.tenants[0].tenantId;
            console.log("Using Tenant:", tenantId);
            const response = await xero.accountingApi.getOrganisations(tenantId);
            console.log("Organisation Name:", response.body.organisations[0].name);
        } else {
            console.log("No tenants found via updateTenants. Trying with empty string...");
            const response = await xero.accountingApi.getOrganisations("");
            console.log("Organisation Name:", response.body.organisations[0].name);
        }
    } catch (e) {
        console.error("Error:", e.response ? e.response.statusCode + ' ' + JSON.stringify(e.response.body) : e.message);
    }
}
test();

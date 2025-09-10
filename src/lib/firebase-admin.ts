
import * as admin from 'firebase-admin';
import { getFirestore as getFirestoreAdminSdk } from 'firebase-admin/firestore';
import serviceAccount from './firebase-service-account.json';

// We need to specify the type of the imported JSON for TypeScript
const serviceAccountParams = {
    type: serviceAccount.type,
    projectId: serviceAccount.project_id,
    privateKeyId: serviceAccount.private_key_id,
    privateKey: serviceAccount.private_key,
    clientEmail: serviceAccount.client_email,
    clientId: serviceAccount.client_id,
    authUri: serviceAccount.auth_uri,
    tokenUri: serviceAccount.token_uri,
    authProviderX509CertUrl: serviceAccount.auth_provider_x509_cert_url,
    clientC509CertUrl: serviceAccount.client_x509_cert_url,
    universeDomain: serviceAccount.universe_domain,
}

export function getFirebaseAdminApp() {
    if (admin.apps.length > 0) {
        return admin.apps[0]!;
    }

    return admin.initializeApp({
        credential: admin.credential.cert(serviceAccountParams)
    });
}

export function getFirestoreAdmin() {
    return getFirestoreAdminSdk(getFirebaseAdminApp());
}

import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
} from 'amazon-cognito-identity-js';

const userPool = new CognitoUserPool({
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
});

function requireConfig(): void {
  if (!import.meta.env.VITE_COGNITO_USER_POOL_ID || !import.meta.env.VITE_COGNITO_CLIENT_ID) {
    throw new Error('Cognito is not configured. Set VITE_COGNITO_USER_POOL_ID and VITE_COGNITO_CLIENT_ID.');
  }
}

export interface AuthUser {
  email: string;
  kitchenId: string;
}

export function getCurrentSessionToken(): Promise<string | null> {
  requireConfig();

  const currentUser = userPool.getCurrentUser();
  if (!currentUser) {
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    currentUser.getSession((error: Error | null, session: { isValid: () => boolean; getIdToken: () => { getJwtToken: () => string } } | null) => {
      if (error) {
        reject(error);
        return;
      }

      if (!session || !session.isValid()) {
        resolve(null);
        return;
      }

      resolve(session.getIdToken().getJwtToken());
    });
  });
}

export function signIn(email: string, password: string): Promise<string> {
  requireConfig();

  const user = new CognitoUser({
    Username: email.trim(),
    Pool: userPool,
  });

  const authDetails = new AuthenticationDetails({
    Username: email.trim(),
    Password: password,
  });

  return new Promise((resolve, reject) => {
    user.authenticateUser(authDetails, {
      onSuccess: (session) => resolve(session.getIdToken().getJwtToken()),
      onFailure: (error) => reject(new Error(error.message || 'Sign in failed')),
    });
  });
}

export function signUp(
  email: string,
  password: string,
  kitchenId: string
): Promise<void> {
  requireConfig();

  const attributes = [
    new CognitoUserAttribute({ Name: 'email', Value: email.trim() }),
    new CognitoUserAttribute({ Name: 'custom:kitchen_id', Value: kitchenId.trim() }),
  ];

  return new Promise((resolve, reject) => {
    userPool.signUp(email.trim(), password, attributes, [], (error) => {
      if (error) {
        reject(new Error(error.message || 'Sign up failed'));
        return;
      }
      resolve();
    });
  });
}

export function signOut(): void {
  const currentUser = userPool.getCurrentUser();
  currentUser?.signOut();
}

export function parseKitchenIdFromToken(token: string): string {
  try {
    const payload = JSON.parse(atob(token.split('.')[1] ?? '')) as Record<string, string>;
    return payload['custom:kitchen_id'] ?? payload.email ?? payload.sub ?? 'kitchen';
  } catch {
    return 'kitchen';
  }
}

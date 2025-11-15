import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  signInWithPopup,
  GoogleAuthProvider,
  getAdditionalUserInfo,
} from "firebase/auth";

export const doCreateUserWithEmailAndPassword = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const doSignInWithEmailAndPassword = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const doSignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();

  const result = await signInWithPopup(auth, provider);
  const token = await result.user.getIdToken();
  const additionalUserInfo = getAdditionalUserInfo(result);
  const isNewUser = additionalUserInfo?.isNewUser ?? false;

  console.log("[google sign-in] ID token:", token);
  console.log("[google sign-in] isNewUser:", isNewUser);

  return { user: result.user, token, isNewUser };
};

export const doSignOut = () => {
  return auth.signOut();
};

export const doPasswordReset = (email:string) => {
  return sendPasswordResetEmail(auth, email);
};

export const doPasswordChange = (password: string) => {
  if (auth.currentUser === null) {
    return Promise.reject(new Error("No authenticated user"));
  }
  return updatePassword(auth.currentUser, password);
};

export const doSendEmailVerification = () => {
  if (auth.currentUser === null) {
    return Promise.reject(new Error("No authenticated user"));
  }
  return sendEmailVerification(auth.currentUser, {
    url: `${window.location.origin}/home`,
  });
};

export const getCurrentIdToken = async (forceRefresh = false) => {
  const u = auth.currentUser;
  if (!u) return null;
  return u.getIdToken(forceRefresh);
};

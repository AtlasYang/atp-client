import axios from "axios";

export type Result<T> = {
  data: T | null;
  error: string | null;
};

export function isOk<T>(result: Result<T>): boolean {
  return result.data !== null;
}

export function unwrapOr<T>(result: Result<T>, fallback: T): T {
  return result.data ?? fallback;
}

export function unwrapOrThrow<T>(result: Result<T>): T {
  if (result.data === null) {
    throw new Error("Result is not Ok");
  }
  return result.data;
}

export async function wrapPromise<T>(promise: Promise<T>): Promise<Result<T>> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return { data: null, error: "Axios Error" + err.response?.status };
    } else {
      return { data: null, error: "Unexpected Error" };
    }
  }
}

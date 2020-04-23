require("isomorphic-fetch");

export const fetchWithAutoPaging = async ({
  mode = "parallel",
  limit = 50,
  initialUrl,
  accessToken,
  extraHeaders = {},
  errorStrategy = "throwOnError",
}: fetchWithAutoPagingArgs) => {
  let allItems = [];

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    ...extraHeaders,
  };
  const url = `${initialUrl}?limit=${limit}`;

  const doFetch = (
    url: string
  ): Promise<{ total: number; items: Array<any> }> =>
    fetch(url, { headers }).then(toJSON);

  const toJSON = async (response: any) => {
    if (response.status !== 200) {
      if (errorStrategy === "throwOnError") {
        const message = JSON.stringify(await response.text());
        throw new FetchWithAutoPagingError({
          status: response.status,
          message,
        });
      }
      if (errorStrategy === "bailOnError") {
        return Promise.resolve({ items: [], total: -1 });
      }
    }
    return response.json();
  };

  // first call needs to be sequential to get the total items
  const { total, items } = await doFetch(url);
  allItems = [...items];

  // manually construct offsets instead of relying on the result.next
  const lastOffset = Math.ceil(total / limit);
  let offsets = Array.from(new Array(lastOffset)).map(
    (_: string, index) => index * limit
  );
  // remove first offset since we already fetched the items for it
  offsets = offsets.slice(1);

  if (mode === "parallel") {
    const parallelPs = offsets.map((offset: number) => {
      const urlWithOffset = `${url}&offset=${offset}`;
      return doFetch(urlWithOffset).then((data) => data.items);
    });
    const nestedItems = await Promise.all(parallelPs);
    allItems = [...allItems, ...nestedItems.flat()];
  }

  if (mode === "sequential") {
    const seqP = offsets.reduce((prevP: Promise<any>, offset: number) => {
      return prevP.then((acc) => {
        const urlWithOffset = `${url}&offset=${offset}`;
        return doFetch(urlWithOffset).then(({ items }) => [...acc, ...items]);
      });
    }, Promise.resolve([]));
    allItems = [...allItems, ...(await seqP)];
  }

  return allItems;
};

export type fetchWithAutoPagingArgs = {
  // endpoint Url for the resource
  initialUrl: string;
  // valid spotify access token (without the auth type eg: Bearer)
  accessToken: string;
  // "parallel" by default
  mode?: "parallel" | "sequential";
  // {50} by default
  limit?: number;
  // additionals headers to pass to the fetch request
  extraHeaders?: {
    [key: string]: string;
  };
  // "throwOnError" by default
  errorStrategy?: "throwOnError" | "bailOnError";
};

export class FetchWithAutoPagingError extends Error {
  status: number;
  constructor({ message, status }: { message: string; status: number }) {
    super(message);
    this.status = status;
  }
}

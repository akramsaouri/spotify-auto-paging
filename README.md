# spotify-auto-paging

Auto paginate Spotify endpoints.

## Installation

```bash
npm install spotify-auto-paging
# or
yarn add spotify-auto-paging
```

## Usage

```javascript
import { fetchWithAutoPaging } from "spotify-auto-paging";

const args = {
  initialUrl: "https://api.spotify.com/v1/me/tracks",
  accessToken:
    "BQBxu8V5WIxXICmZg-4J6ZeLq-9ifz2x7QuVYNzI3yolLuhQxSrVScdxU5-2O2dB2L_EqTyE8dmtBh2gCSV4vc1RE_duXckaZy43Z1klFX2qnuWlBk9oPW1NrErOiweExNYYHtp2grK_ru_8EIqYcIONLdhsYb78008qcm3XdAZ5eITL4rBFapEM7gA",
};
fetchWithAutoPaging(args).then((tracks) => console.log(tracks));
```

## All arguments

```typescript
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
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)

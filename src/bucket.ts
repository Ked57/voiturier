import aws4 from "aws4";
import { writeFileSync } from "fs";
import fetch from "node-fetch";
import { config } from "./app";
import { State } from "./store";

const generateS3Credentials = () => ({
  accessKeyId: config.SCALEWAY_ACCESS_KEY,
  secretAccessKey: config.SCALEWAY_SECRET_KEY,
  region: config.SCALEWAY_REGION,
  endpoint: config.SCALEWAY_HOST,
});

const generateS3Options = (method: "PUT" | "GET" | "DELETE", path: string) => ({
  service: "s3",
  region: config.SCALEWAY_REGION,
  method,
  path: `/${path}`,
  host: config.SCALEWAY_HOST,
  headers: {
    "Content-Type": "application/octet-stream",
  },
});

// export const deleteObject = async (path: string) => {
//   const hash = aws4.sign(
//     {
//       service: "s3",
//       region: config.SCALEWAY_REGION,
//       method: "DELETE",
//       host: config.SCALEWAY_HOST,
//       headers: {
//         "Content-Type": "application/octet-stream",
//       },
//     },
//     {
//       accessKeyId: config.SCALEWAY_ACCESS_KEY,
//       secretAccessKey: config.SCALEWAY_SECRET_KEY,
//       region: config.SCALEWAY_REGION,
//       endpoint: config.SCALEWAY_HOST,
//     }
//   );
//   const response = await fetch(`https://${config.SCALEWAY_HOST}/${path}`, {
//     method: "DELETE",
//     headers: hash.headers,
//   });
//   if (!response.ok) {
//     throw response;
//   }
// };

export const putObject = async (path: string, db: State) => {
  await writeFileSync(`./${path}`, JSON.stringify(db));
  const hash = aws4.sign(generateS3Options("PUT", path), generateS3Credentials());
  const response = await fetch(`https://${config.SCALEWAY_HOST}`, {
    method: "PUT",
    headers: hash.headers,
  });
  if (!response.ok) {
    console.error("ERROR UPDATING", await response.text());
    throw response;
  }
};

export const getObject = async (path: string) => {
  const hash = aws4.sign({
    service: "s3",
    region: config.SCALEWAY_REGION,
    method: "GET",
    path: `/${path}`,
    host: config.SCALEWAY_HOST,
    headers: {
      "Content-Type": "application/octet-stream",
    },
  }, {
    accessKeyId: config.SCALEWAY_ACCESS_KEY,
    secretAccessKey: config.SCALEWAY_SECRET_KEY,
    region: config.SCALEWAY_REGION,
    endpoint: config.SCALEWAY_HOST,
  });
  const response = await fetch(`https://${config.SCALEWAY_HOST}`, {
    method: "GET",
    headers: hash.headers,
  });
  if (!response.ok) {
    console.error("ERROR READING", await response.text());
    throw response;
  }
  const payload = await response.json();
  return payload;
};

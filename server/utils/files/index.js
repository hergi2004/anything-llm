const fs = require("fs");
const path = require("path");
const { v5: uuidv5 } = require("uuid");

// Should take in a folder that is a subfolder of documents
// eg: youtube-subject/video-123.json
async function fileData(filePath = null) {
  if (!filePath) throw new Error("No docPath provided in request");

  const fullPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(
          __dirname,
          `../../storage/documents/${normalizePath(filePath)}`
        )
      : path.resolve(
          process.env.STORAGE_DIR,
          `documents/${normalizePath(filePath)}`
        );

  const fileExists = fs.existsSync(fullPath);
  if (!fileExists) return null;

  const data = fs.readFileSync(fullPath, "utf8");
  return JSON.parse(data);
}

async function viewLocalFiles() {
  const folder =
    process.env.NODE_ENV === "development"
      ? path.resolve(__dirname, `../../storage/documents`)
      : path.resolve(process.env.STORAGE_DIR, `documents`);
  const dirExists = fs.existsSync(folder);
  if (!dirExists) fs.mkdirSync(folder);

  const directory = {
    name: "documents",
    type: "folder",
    items: [],
  };

  for (const file of fs.readdirSync(folder)) {
    if (path.extname(file) === ".md") continue;

    const folderPath =
      process.env.NODE_ENV === "development"
        ? path.resolve(__dirname, `../../storage/documents/${file}`)
        : path.resolve(process.env.STORAGE_DIR, `documents/${file}`);

    const isFolder = fs.lstatSync(folderPath).isDirectory();
    if (isFolder) {
      const subdocs = {
        name: file,
        type: "folder",
        items: [],
      };
      const subfiles = fs.readdirSync(folderPath);

      for (const subfile of subfiles) {
        if (path.extname(subfile) !== ".json") continue;
        const filePath = path.join(folderPath, subfile);
        const rawData = fs.readFileSync(filePath, "utf8");
        const cachefilename = `${file}/${subfile}`;
        const { pageContent, ...metadata } = JSON.parse(rawData);

        subdocs.items.push({
          name: subfile,
          type: "file",
          ...metadata,
          cached: await cachedVectorInformation(cachefilename, true),
        });
      }
      directory.items.push(subdocs);
    }
  }

  return directory;
}

// Searches the vector-cache folder for existing information so we dont have to re-embed a
// document and can instead push directly to vector db.
async function cachedVectorInformation(filename = null, checkOnly = false) {
  if (!filename) return checkOnly ? false : { exists: false, chunks: [] };

  const digest = uuidv5(filename, uuidv5.URL);
  const file =
    process.env.NODE_ENV === "development"
      ? path.resolve(__dirname, `../../storage/vector-cache/${digest}.json`)
      : path.resolve(process.env.STORAGE_DIR, `vector-cache/${digest}.json`);
  const exists = fs.existsSync(file);

  if (checkOnly) return exists;
  if (!exists) return { exists, chunks: [] };

  console.log(
    `Cached vectorized results of ${filename} found! Using cached data to save on embed costs.`
  );
  const rawData = fs.readFileSync(file, "utf8");
  return { exists: true, chunks: JSON.parse(rawData) };
}

// vectorData: pre-chunked vectorized data for a given file that includes the proper metadata and chunk-size limit so it can be iterated and dumped into Pinecone, etc
// filename is the fullpath to the doc so we can compare by filename to find cached matches.
async function storeVectorResult(vectorData = [], filename = null) {
  if (!filename) return;
  console.log(
    `Caching vectorized results of ${filename} to prevent duplicated embedding.`
  );
  const folder =
    process.env.NODE_ENV === "development"
      ? path.resolve(__dirname, `../../storage/vector-cache`)
      : path.resolve(process.env.STORAGE_DIR, `vector-cache`);

  if (!fs.existsSync(folder)) fs.mkdirSync(folder);

  const digest = uuidv5(filename, uuidv5.URL);
  const writeTo = path.resolve(folder, `${digest}.json`);
  fs.writeFileSync(writeTo, JSON.stringify(vectorData), "utf8");
  return;
}

// Purges a file from the documents/ folder.
async function purgeSourceDocument(filename = null) {
  if (!filename) return;
  console.log(`Purging source document of ${filename}.`);
  const filePath =
    process.env.NODE_ENV === "development"
      ? path.resolve(
          __dirname,
          `../../storage/documents`,
          normalizePath(filename)
        )
      : path.resolve(
          process.env.STORAGE_DIR,
          `documents`,
          normalizePath(filename)
        );

  if (!fs.existsSync(filePath)) return;
  fs.rmSync(filePath);
  return;
}

// Purges a vector-cache file from the vector-cache/ folder.
async function purgeVectorCache(filename = null) {
  if (!filename) return;
  console.log(`Purging vector-cache of ${filename}.`);

  const digest = uuidv5(filename, uuidv5.URL);
  const filePath =
    process.env.NODE_ENV === "development"
      ? path.resolve(__dirname, `../../storage/vector-cache`, `${digest}.json`)
      : path.resolve(process.env.STORAGE_DIR, `vector-cache`, `${digest}.json`);

  if (!fs.existsSync(filePath)) return;
  fs.rmSync(filePath);
  return;
}

// Search for a specific document by its unique name in the entire `documents`
// folder via iteration of all folders and checking if the expected file exists.
async function findDocumentInDocuments(documentName = null) {
  if (!documentName) return null;
  const documentsFolder =
    process.env.NODE_ENV === "development"
      ? path.resolve(__dirname, `../../storage/documents`)
      : path.resolve(process.env.STORAGE_DIR, `documents`);

  for (const folder of fs.readdirSync(documentsFolder)) {
    const isFolder = fs
      .lstatSync(path.join(documentsFolder, folder))
      .isDirectory();
    if (!isFolder) continue;

    const targetFilename = normalizePath(documentName);
    const targetFileLocation = path.join(
      documentsFolder,
      folder,
      targetFilename
    );
    if (!fs.existsSync(targetFileLocation)) continue;

    const fileData = fs.readFileSync(targetFileLocation, "utf8");
    const cachefilename = `${folder}/${targetFilename}`;
    const { pageContent, ...metadata } = JSON.parse(fileData);
    return {
      name: targetFilename,
      type: "file",
      ...metadata,
      cached: await cachedVectorInformation(cachefilename, true),
    };
  }

  return null;
}

function normalizePath(filepath = "") {
  return path.normalize(filepath).replace(/^(\.\.(\/|\\|$))+/, "");
}

module.exports = {
  findDocumentInDocuments,
  cachedVectorInformation,
  viewLocalFiles,
  purgeSourceDocument,
  purgeVectorCache,
  storeVectorResult,
  fileData,
  normalizePath,
};

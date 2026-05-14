import path from "path";
import fs from "fs";

export const Node = {
  isFile: function(filename: string) {
    try {
      return fs.lstatSync(filename).isFile();
    } catch (err) {
      console.log(err);
      return false;
    }
  },

  getFullPath: function(folderPath: string) {
    return fs.readdirSync(folderPath).map(fn => path.join(folderPath, fn));
  },

  getFiles: function(dir: string) {
    let results: string[] = [];
    const list = fs.readdirSync(dir);

    list.forEach(function(fileName) {
      fileName = path.join(dir, fileName);
      const stat = fs.statSync(fileName);
      if (stat && stat.isDirectory()) {
        /* Recurse into a subdirectory */
        results = results.concat(Node.getFiles(fileName));
      } else {
        /* Is a file */
        results.push(fileName);
      }
    });

    return results.filter(f => f.endsWith(".md"));
  },

  readFileSync: function(fullPath: string) {
    return fs.readFileSync(fullPath, "utf8");
  },

  getMarkdownFolder: function() {
    return path.join(process.cwd(), "wiki");
  },
};
"use client";

import * as React from "react";
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";
import { usePathname, useRouter } from "next/navigation";
import { styled } from "@mui/material/styles";
import { ParsedPostData, ParsedPostDirectoryData } from "../../lib/utils";
import { isCurrentRoutePath } from "../../lib/routePath";

interface FolderTreeProps {
  tree: ParsedPostDirectoryData;
  flattenNodes: (ParsedPostData | ParsedPostDirectoryData)[];
}

export default function FolderTree({ tree, flattenNodes }: Readonly<FolderTreeProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const currentPost = React.useMemo(() => {
    return flattenNodes.find(aNode => {
      return "routePath" in aNode && isCurrentRoutePath(aNode.routePath, pathname);
    });
  }, [flattenNodes, pathname]);
  const currentAncestorIds = React.useMemo(() => {
    return getAncestorIds(currentPost?.id ?? tree.id);
  }, [currentPost?.id, tree.id]);
  const renderTree = (nodes: ParsedPostDirectoryData | ParsedPostData) => (
    <TCTreeItem key={nodes.id} label={nodes.name} itemId={nodes.id}>
      {"children" in nodes ? nodes.children.map(node => renderTree(node)) : null}
    </TCTreeItem>
  );

  return (
    <SimpleTreeView
      key={pathname}
      aria-label="rich object"
      onItemFocus={(event, selectedItemText) => {
        const selectedPost = flattenNodes.find(aNode => {
          return aNode.id === selectedItemText;
        });
        if (selectedPost != null && "routePath" in selectedPost && selectedPost.routePath != null) {
          router.push(selectedPost.routePath);
        }
      }}
      defaultExpandedItems={currentAncestorIds}
      sx={{ flexGrow: 1, maxWidth: 400, overflowY: "auto" }}
    >
      {renderTree(tree)}
    </SimpleTreeView>
  );
}

function getAncestorIds(itemId: string) {
  const parts = itemId.split("/");
  if (parts.length <= 1) {
    return [itemId];
  }

  return parts.slice(0, -1).map((_, index) => parts.slice(0, index + 1).join("/"));
}

const TCTreeItem = styled(TreeItem)(({ theme }) => ({
  "& .MuiTreeItem-content": {
    "& .MuiTreeItem-label": {
      fontSize: "1rem",
      paddingLeft: "6px",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif,",
      lineHeight: 2.0,
    },
  },
}));

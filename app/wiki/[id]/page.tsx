import { getAllSlugs, getPageData, ParsedPostDirectoryData } from "../../../lib/utils";
import PageView from "../../_components/PageView";
import { SearchParams } from "next/dist/server/request/search-params";

export interface PageProps {
  params: Promise<Record<string, string>>;
  searchParams: Promise<SearchParams>;
}

export default async function Detail({ params }: PageProps) {
  const paramId = (await params).id;
  const postData = await getPageData(decodeURIComponent(paramId));

  return (
    <PageView graphData={postData.graphData} content={postData.content} tree={postData.tree as ParsedPostDirectoryData}
              flattenNodes={postData.flattenNodes} backLinks={postData.backLinks}/>
  );
}

export async function generateStaticParams() {
  const allPostsData = getAllSlugs();
  return allPostsData.map((path) => ({ id: path }));
}

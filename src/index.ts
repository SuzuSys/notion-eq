#!/usr/bin/env node
import dotenv from "dotenv";
import { Client, isFullBlock } from "@notionhq/client";
import {
  ListBlockChildrenResponse,
  UpdateBlockParameters,
} from "@notionhq/client/build/src/api-endpoints";
import {
  collectPaginatedAPI,
  isFullPage,
} from "@notionhq/client/build/src/helpers";

dotenv.config();

const blockIdRe = /(?<=#)[A-Za-z0-9]{32}$/;
const tagRe = /(?<=\\tag\{)\d*(?=\})/g;

type RichTextItemRequest = Extract<
  UpdateBlockParameters,
  { type?: "paragraph" }
>["paragraph"]["rich_text"][number];
type BlockId = string;

const NOTION_TOKEN = "NOTION_TOKEN";
const PAGE_ID = "PAGE_ID";
const MULTIDB_ID = "MULTIPLE_TAGS_DB_ID";

const PARAGRAPH_LINK = "Paragraph Link";
const INDEX = "Index";

const EQ_PREFIX = "EQ_PREFIX";
const EQ_SUFFIX = "EQ_SUFFIX";

(async () => {
  let EqPrefix = process.env[EQ_PREFIX];
  if (!EqPrefix) {
    EqPrefix = "Eq. (";
  }
  let EqSuffix = process.env[EQ_SUFFIX];
  if (!EqSuffix) {
    EqSuffix = ")";
  }
  const token = process.env[NOTION_TOKEN];
  if (!token) {
    throw Error(`token: ${NOTION_TOKEN} is undefined.`);
  }
  const client = new Client({
    auth: token,
  });

  const multiDbId = process.env[MULTIDB_ID];
  if (!multiDbId) {
    throw Error(`token: ${MULTIDB_ID} is undefined.`);
  }

  const queried = await collectPaginatedAPI(client.databases.query, {
    database_id: multiDbId,
  });

  const tagIndices: Map<BlockId, number[]> = new Map();
  for (const record of queried) {
    if (
      !(
        isFullPage(record) &&
        PARAGRAPH_LINK in record.properties &&
        record.properties[PARAGRAPH_LINK].type === "title" &&
        record.properties[PARAGRAPH_LINK].title[0].type === "text" &&
        record.properties[PARAGRAPH_LINK].title[0].text.link &&
        INDEX in record.properties &&
        record.properties[INDEX].type === "rich_text" &&
        record.properties[INDEX].rich_text[0].type === "text"
      )
    ) {
      throw Error(`Unexpected object detected.`);
    }
    const link = record.properties[PARAGRAPH_LINK].title[0].text.link.url;
    const matchedBlockId = link.match(blockIdRe);
    if (!matchedBlockId) {
      throw Error(`Unexpected object detected.`);
    }
    const blockId = matchedBlockId[0];
    const splittedIndecesStr =
      record.properties[INDEX].rich_text[0].plain_text.split(/\s*,\s*/);
    const indeces = splittedIndecesStr.map((v) => parseInt(v));
    tagIndices.set(blockId, indeces);
  }

  const pageId = process.env[PAGE_ID];
  if (!pageId) {
    throw Error(`token: ${PAGE_ID} is undefined.`);
  }
  const { results }: ListBlockChildrenResponse =
    await client.blocks.children.list({
      block_id: pageId,
    });
  interface EqInfo {
    begin: number;
    numberOfTags: number;
  }
  const blockIdTagMap: Map<BlockId, EqInfo> = new Map();
  const updateTask: UpdateBlockParameters[] = [];
  let numbering = 1;
  for (const block of results) {
    if (!isFullBlock(block)) continue;
    if (block.type === "equation") {
      const eq = block.equation.expression;
      const beginNumber = numbering;
      const updatedEq = eq.replaceAll(tagRe, () => {
        const n = numbering;
        numbering++;
        return n.toString();
      });
      if (beginNumber !== numbering) {
        blockIdTagMap.set(block.id.replaceAll("-", ""), {
          begin: beginNumber,
          numberOfTags: numbering - beginNumber,
        });
        if (updatedEq !== eq) {
          updateTask.push({
            block_id: block.id,
            equation: {
              expression: updatedEq,
            },
          });
        }
      }
    } else if (block.type === "paragraph") {
      const newRichText: RichTextItemRequest[] = [];
      let updateFlag = false;
      let multiIndex = 0;
      for (let text of block.paragraph.rich_text) {
        if (text.type === "text") {
          if (text.text.link) {
            const matched = text.text.link.url.match(blockIdRe);
            if (matched) {
              const blockId = matched[0];
              const tagObj = blockIdTagMap.get(blockId);
              if (!tagObj) continue;
              let eqNumber;
              if (tagObj.numberOfTags === 1) {
                eqNumber = tagObj.begin;
              } else {
                const pluses = tagIndices.get(block.id.replaceAll("-", ""));
                if (pluses === undefined) {
                  throw Error(
                    `The block referencing ${EqPrefix}${
                      tagObj.begin
                    }${EqSuffix} - ${EqPrefix}${
                      tagObj.begin + tagObj.numberOfTags - 1
                    }${EqSuffix} has not been registered in the multiple tags db.`
                  );
                }
                if (pluses.length <= multiIndex) {
                  throw Error(
                    `The number of registered indices related to ${EqPrefix}${
                      tagObj.begin
                    }${EqSuffix} - ${EqPrefix}${
                      tagObj.begin + tagObj.numberOfTags - 1
                    }${EqSuffix} is insufficient.`
                  );
                }
                const plus = pluses[multiIndex];
                if (Number.isNaN(plus)) {
                  throw Error(
                    `Registered indices related to ${EqPrefix}${
                      tagObj.begin
                    }${EqSuffix} - ${EqPrefix}${
                      tagObj.begin + tagObj.numberOfTags - 1
                    }${EqSuffix} is invalid. (NaN detected.)`
                  );
                }
                if (plus >= tagObj.numberOfTags) {
                  throw Error(
                    `One of registered indices related to ${EqPrefix}${
                      tagObj.begin
                    }${EqSuffix} - ${EqPrefix}${
                      tagObj.begin + tagObj.numberOfTags - 1
                    }${EqSuffix} is out of range. (must <${
                      tagObj.numberOfTags
                    })`
                  );
                }
                eqNumber = tagObj.begin + plus;
                multiIndex++;
              }
              const correctLink = `${EqPrefix}${eqNumber}${EqSuffix}`;
              if (
                text.text.content !== correctLink ||
                text.plain_text !== correctLink
              ) {
                text.text.content =
                  text.plain_text = `${EqPrefix}${eqNumber}${EqSuffix}`;
                updateFlag = true;
              }
            }
          }
          newRichText.push(text);
        } else if (text.type === "equation") {
          newRichText.push(text);
        }
        // mention block should not be pushed
      }
      if (updateFlag) {
        updateTask.push({
          block_id: block.id,
          paragraph: {
            rich_text: newRichText,
            color: block.paragraph.color,
          },
        });
        await client.blocks.update({
          block_id: block.id,
          paragraph: {
            rich_text: newRichText,
            color: block.paragraph.color,
          },
        });
      }
    }
  }
  let idx = 1;
  // The following loop cannot be run concurrently. A conflict may occur.
  for (const obj of updateTask) {
    await client.blocks.update(obj);
    console.log(`${idx++}/${updateTask.length}`);
  }
})()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

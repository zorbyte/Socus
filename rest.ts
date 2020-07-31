import RequestHandler from "./lib/rest/request_handler.ts";
import { APITypes } from "./lib/deps.ts";
import createObject from "./lib/util/create_object.ts";
import validateAllowedMentions from "./lib/util/allowed_mentions.ts";
const rest = RequestHandler.get();

type TypeByID<T extends APITypes.DataTypes> = {
  id: string;
  [APITypes.DATA_SYMBOL]: T;
};

export default rest;

export function create(
  parent: APITypes.Channel | TypeByID<APITypes.DataTypes.CHANNEL>,
  type: APITypes.DataTypes.MESSAGE,
  payload: APITypes.MessageCreatePayload,
): Promise<APITypes.Message>;
export async function create(
  parent: {
    id: string;
    [APITypes.DATA_SYMBOL]: APITypes.DataTypes;
  },
  type: APITypes.DataTypes,
  payload: any,
): Promise<any> {
  if (parent[APITypes.DATA_SYMBOL] === APITypes.DataTypes.CHANNEL) {
    if (type === APITypes.DataTypes.MESSAGE) {
      const p = <APITypes.MessageCreatePayload> payload;
      if (!p.files || !p.content || !p.embed) {
        throw new Error("Missing message content");
      }
      validateAllowedMentions(p.allowed_mentions);
      let body: APITypes.MessageCreatePayload | FormData = payload;
      if (p.files && p.files.length > 0) {
        body = new FormData();
        for (const file of p.files) {
          body.append("file", file);
        }
        delete p.files;
        body.append("payload_json", JSON.stringify(p));
      }
      return createObject(
        await rest.request(
          "POST",
          `/channels/${parent.id}/messages`,
          true,
          body,
        ),
        APITypes.DataTypes.MESSAGE,
      );
    }
  }
}

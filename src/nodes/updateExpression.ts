import { AddUpdateExpression } from "./addUpdateExpression";
import { RemoveUpdateExpression } from "./removeUpdateExpression";
import { SetUpdateExpression } from "./setUpdateExpression";

export type UpdateExpression = {
  readonly kind: "UpdateExpression";
  readonly setUpdateExpressions: SetUpdateExpression[];
  readonly removeUpdateExpressions: RemoveUpdateExpression[];
  readonly addUpdateExpressions: AddUpdateExpression[];
};

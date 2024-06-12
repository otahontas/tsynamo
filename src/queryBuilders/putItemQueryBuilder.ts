import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { PutNode } from "../nodes/putNode";
import { ReturnValuesOptions } from "../nodes/returnValuesNode";
import { QueryCompiler } from "../queryCompiler";
import { ExecuteOutput, ObjectKeyPaths } from "../typeHelpers";
import { preventAwait } from "../util/preventAwait";
import {
  AttributeBeginsWithExprArg,
  AttributeBetweenExprArg,
  AttributeContainsExprArg,
  AttributeFuncExprArg,
  BuilderExprArg,
  ComparatorExprArg,
  ExprArgs,
  ExpressionBuilder,
  NotExprArg,
} from "./expressionBuilder";

export interface PutItemQueryBuilderInterface<
  DDB,
  Table extends keyof DDB,
  O extends DDB[Table]
> {
  /**
   * A condition that must be satisfied in order for a PutItem operation to be executed.
   *
   * Multiple FilterExpressions are added as `AND` statements. see {@link orConditionExpression} for `OR` statements.
   *
   * Example
   *
   * ```ts
   * await tsynamoClient
   *   .putItem("myTable")
   *   .item({
   *     userId: "333",
   *     dataTimestamp: 222,
   *     someBoolean: true,
   *    })
   *   .conditionExpression("userId", "attribute_not_exists")
   *   .execute()
   * ```
   */
  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: ComparatorExprArg<DDB, Table, Key>
  ): PutItemQueryBuilder<DDB, Table, O>;

  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeFuncExprArg<Key>
  ): PutItemQueryBuilder<DDB, Table, O>;

  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeBeginsWithExprArg<Key>
  ): PutItemQueryBuilder<DDB, Table, O>;

  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeContainsExprArg<DDB, Table, Key>
  ): PutItemQueryBuilder<DDB, Table, O>;

  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeBetweenExprArg<DDB, Table, Key>
  ): PutItemQueryBuilder<DDB, Table, O>;

  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: NotExprArg<DDB, Table, Key>
  ): PutItemQueryBuilder<DDB, Table, O>;

  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: BuilderExprArg<DDB, Table, Key>
  ): PutItemQueryBuilder<DDB, Table, O>;

  /**
   * A {@link conditionExpression} that is concatenated as an OR statement.
   *
   * A condition that must be satisfied in order for a PutItem operation to be executed.
   *
   * Example
   *
   * ```ts
   * await tsynamoClient
   *   .putItem("myTable")
   *   .item({
   *     userId: "333",
   *     dataTimestamp: 222,
   *     someBoolean: true,
   *    })
   *   .conditionExpression("userId", "attribute_not_exists")
   *   .execute()
   * ```
   */
  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: ComparatorExprArg<DDB, Table, Key>
  ): PutItemQueryBuilder<DDB, Table, O>;

  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeFuncExprArg<Key>
  ): PutItemQueryBuilder<DDB, Table, O>;

  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeBeginsWithExprArg<Key>
  ): PutItemQueryBuilder<DDB, Table, O>;

  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeContainsExprArg<DDB, Table, Key>
  ): PutItemQueryBuilder<DDB, Table, O>;

  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: AttributeBetweenExprArg<DDB, Table, Key>
  ): PutItemQueryBuilderInterface<DDB, Table, O>;

  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: NotExprArg<DDB, Table, Key>
  ): PutItemQueryBuilder<DDB, Table, O>;

  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: BuilderExprArg<DDB, Table, Key>
  ): PutItemQueryBuilder<DDB, Table, O>;

  // TODO: returnValues should probably just be `returnValues()` without any parameters as ALL_OLD is the only value it takes.

  /**
   *
   * Use this if you want to get the item attributes as they appeared before they were updated with the PutItem request.
   *
   * The valid values are:
   *
   *  - NONE - If returnValues is not specified, or if its value is NONE, then nothing is returned. (This setting is the default.)
   *
   *  - ALL_OLD - If PutItem overwrote an attribute name-value pair, then the content of the old item is returned.
   *
   * The values returned are strongly consistent.
   */
  returnValues(
    option: Extract<ReturnValuesOptions, "NONE" | "ALL_OLD">
  ): PutItemQueryBuilder<DDB, Table, O>;

  /**
   * The item that is put into the table.
   *
   * Only the primary key attributes are required; you can optionally provide other attribute name-value pairs for the item.
   *
   * You must provide all of the attributes for the primary key. For example, with a simple primary key, you only need to provide a value for the partition key. For a composite primary key, you must provide values for both the partition key and the sort key.
   *
   * If you specify any attributes that are part of an index key, then the data types for those attributes must match those of the schema in the table's attribute definition.
   *
   * Example
   *
   * ```ts
   * await tsynamoClient
   *   .putItem("myTable")
   *   .item({
   *     userId: "333",
   *     dataTimestamp: 222,
   *     someBoolean: true,
   *    })
   *   .execute()
   * ```
   */
  item<Item extends ExecuteOutput<O>>(
    item: Item
  ): PutItemQueryBuilder<DDB, Table, O>;

  /**
   * Compiles into an DynamoDB DocumentClient Command.
   */
  compile(): PutCommand;
  /**
   * Executes the command and returns its output.
   */
  execute(): Promise<ExecuteOutput<O>[] | undefined>;
}

export class PutItemQueryBuilder<
  DDB,
  Table extends keyof DDB,
  O extends DDB[Table]
> implements PutItemQueryBuilderInterface<DDB, Table, O>
{
  readonly #props: PutItemQueryBuilderProps;

  constructor(props: PutItemQueryBuilderProps) {
    this.#props = props;
  }

  conditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: ExprArgs<DDB, Table, O, Key>
  ): PutItemQueryBuilder<DDB, Table, O> {
    const eB = new ExpressionBuilder<DDB, Table, O>({
      node: { ...this.#props.node.conditionExpression },
    });

    const expressionNode = eB.expression(...args)._getNode();

    return new PutItemQueryBuilder<DDB, Table, O>({
      ...this.#props,
      node: {
        ...this.#props.node,
        conditionExpression: expressionNode,
      },
    });
  }

  orConditionExpression<Key extends ObjectKeyPaths<DDB[Table]>>(
    ...args: ExprArgs<DDB, Table, O, Key>
  ): PutItemQueryBuilder<DDB, Table, O> {
    const eB = new ExpressionBuilder<DDB, Table, O>({
      node: { ...this.#props.node.conditionExpression },
    });

    const expressionNode = eB.orExpression(...args)._getNode();

    return new PutItemQueryBuilder<DDB, Table, O>({
      ...this.#props,
      node: {
        ...this.#props.node,
        conditionExpression: expressionNode,
      },
    });
  }

  item<Item extends ExecuteOutput<O>>(
    item: Item
  ): PutItemQueryBuilder<DDB, Table, O> {
    return new PutItemQueryBuilder<DDB, Table, O>({
      ...this.#props,
      node: {
        ...this.#props.node,
        item: {
          kind: "ItemNode",
          item,
        },
      },
    });
  }

  returnValues(
    option: Extract<ReturnValuesOptions, "NONE" | "ALL_OLD">
  ): PutItemQueryBuilder<DDB, Table, O> {
    return new PutItemQueryBuilder<DDB, Table, O>({
      ...this.#props,
      node: {
        ...this.#props.node,
        returnValues: {
          kind: "ReturnValuesNode",
          option,
        },
      },
    });
  }

  compile = (): PutCommand => {
    return this.#props.queryCompiler.compile(this.#props.node);
  };

  execute = async (): Promise<ExecuteOutput<O>[] | undefined> => {
    const putCommand = this.compile();
    const data = await this.#props.ddbClient.send(putCommand);
    return data.Attributes as any;
  };

  public get node() {
    return this.#props.node;
  }
}

preventAwait(
  PutItemQueryBuilder,
  "Don't await PutQueryBuilder instances directly. To execute the query you need to call the `execute` method"
);

interface PutItemQueryBuilderProps {
  readonly node: PutNode;
  readonly ddbClient: DynamoDBDocumentClient;
  readonly queryCompiler: QueryCompiler;
}

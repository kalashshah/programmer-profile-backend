import { GraphQLDefinitionsFactory } from '@nestjs/graphql';
import { join } from 'path';

const definitionsFactory = new GraphQLDefinitionsFactory();

/* Generating the types for the GraphQL schema. */
definitionsFactory.generate({
  typePaths: ['./graphql/*.graphql'],
  path: join(process.cwd(), 'src/graphql.types.ts'),
  outputAs: 'class',
  watch: true,
});

import { UpdateClientDto } from '../src/dtos';
import { generateUpdateAttributes } from '../src/repository';

describe('generateUpdateAttributes', () => {
  it('Generate update attributes', () => {
    const fieldsToUpdate: UpdateClientDto = {
      name: 'Jan',
      surname: 'Kowal',
    };

    const { expression, expressionAttributeNames, expressionAttributeValues } =
      generateUpdateAttributes(fieldsToUpdate)!;

    expect(expression).toBe('SET #name = :name_val, #surname = :surname_val');

    expect(expressionAttributeNames).toEqual({
      '#name': 'Name',
      '#surname': 'Surname',
    });

    expect(expressionAttributeValues).toEqual({
      ':name_val': 'Jan',
      ':surname_val': 'Kowal',
    });
  });

  it('No fields are provided', () => {
    const fieldsToUpdate: UpdateClientDto = {};

    const result = generateUpdateAttributes(fieldsToUpdate);

    expect(result).toBe(undefined);
  });
});

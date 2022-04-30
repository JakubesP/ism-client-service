import { camelizeKeys } from 'ism-common';

export interface Client {
  Id: string;
  Name: string;
  Surname: string;
  Email: string;
  PersonalCode: string;
  DateOfBirth: string;
  Deactivated: boolean;
}

export const presentClient = (client: Client): object => {
  return {
    ...camelizeKeys(client),
  };
};

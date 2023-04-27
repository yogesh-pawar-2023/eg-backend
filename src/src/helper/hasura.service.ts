import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class HasuraService {
  public url = process.env.HASURA_BASE_URL;
  constructor(private readonly httpService: HttpService) {}

  public async findAll(tableName: String, filters: Object = {}) {
    let query = '';
    if (filters) {
      Object.keys(filters).forEach((e) => {
        if (filters[e] && filters[e] != '') {
          query += `${e}:{_eq:"${filters[e]}"}`;
        }
      });
    }

    var data = {
      query: `query SearchUser {
        ${tableName}_aggregate(where:{${query}}) {
          aggregate {
            count
          }
        }
        ${tableName}(where:{${query}}) {
          mobile
          aadhar_token
        }}`,
    };

    return await lastValueFrom(
      this.httpService
        .post(this.url, data, {
          headers: {
            'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET,
            'Content-Type': 'application/json',
          },
        })
        .pipe(map((res) => res.data)),
    );
  }

  queryMulti(tableName: String, items: any, onlyFields: any, fields: any = []) {
    let returnkeys = [];
    const getObjStr = (item: Object, type: String = '') => {
      let str = '[';
      items.forEach((item, pindex) => {
        const keys = Object.keys(item);
        str += '{';
        keys.forEach((e, index) => {
          if (!returnkeys.includes(e)) {
            returnkeys = [...returnkeys, e];
          }
          if (onlyFields.length < 1 || onlyFields.includes(e)) {
            if (type === 'obj') {
              str += `${e}:"${item[e]}"${keys.length > index + 1 ? ',' : ''}`;
            } else {
              str += `$${e}:String${keys.length > index + 1 ? ',' : ''}`;
            }
          }
        });
        str += `}${items.length > pindex + 1 ? ',' : ''}`;
      });
      return (str += ']');
    };

    const getParam = (keys: any) => {
      let str = '';
      keys.forEach((e: any, index: any) => {
        str += `${e}${keys.length > index + 1 ? '\n' : ''}`;
      });
      return str;
    };

    return `mutation MyQuery {
      ${tableName}(objects: ${getObjStr(items, 'obj')}) {
        returning {${getParam(
          fields ? fields : onlyFields ? [...onlyFields, 'id'] : returnkeys,
        )}}
      }
    }
    `;
  }

  deleteQuery(tName: String, item: any, onlyFields: any = []) {
    let tableName = `delete_${tName}`;
    const keys = Object.keys(item);

    const getObjStr = (item: any, type: String = '') => {
      let str = ``;
      let strArr = [];
      keys.forEach((e) => {
        if (onlyFields.length < 1 || onlyFields.includes(e)) {
          if (type === 'obj') {
            strArr = [...strArr, `${e}:{_eq:"${item[e]}"}`];
          }
        }
      });
      str += strArr.join();
      return str;
    };

    return `mutation DeleteQuery {
      ${tableName}(where: {${getObjStr(item, 'obj')}}) {
         affected_rows
      }
    }
    `;
  }

  async delete(tableName: String, item: Object, onlyFields: any = []) {
    return this.getResponce(
      await lastValueFrom(
        this.httpService
          .post(
            this.url,
            {
              query: this.deleteQuery(tableName, item, onlyFields),
            },
            {
              headers: {
                'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET,
                'Content-Type': 'application/json',
              },
            },
          )
          .pipe(map((res) => res.data)),
      ),
      tableName,
    );
  }

  query(
    tName: String,
    item: any,
    onlyFields: any = [],
    update: boolean = false,
    fields: any = [],
  ) {
    let tableName = `insert_${tName}_one`;
    if (item?.id && update) {
      tableName = `update_${tName}`;
    }
    const keys = Object.keys(item);
    const getObjStr = (item: any, type: String = '') => {
      let str = 'object: {';
      if (item?.id && update) {
        str = `where: {id: {_eq: ${item?.id}}}, _set: {`;
      }
      let strArr = [];
      keys.forEach((e, index) => {
        if (e !== 'id' && (onlyFields.length < 1 || onlyFields.includes(e))) {
          if (type === 'obj') {
            strArr = [...strArr, `${e}:"${item[e]}"`];
          } else {
            strArr = [...strArr, `${e}:String`];
          }
        }
      });
      str += strArr.join();
      str += `}`;
      return str;
    };

    const getParam = (keys: any) => {
      let str = '';
      keys.forEach((e: any, index: any) => {
        str += `${e}${keys.length > index + 1 ? '\n' : ''}`;
      });
      return str;
    };

    return `mutation MyQuery {
      ${tableName}(${getObjStr(item, 'obj')}) {
        ${
          !(item?.id && update)
            ? getParam(
                fields && fields.length > 0
                  ? fields
                  : onlyFields
                  ? [...onlyFields, 'id']
                  : keys,
              )
            : 'affected_rows'
        }
      }
    }
    `;
  }

  async q(
    tableName: String,
    item: Object,
    onlyFields: any = [],
    update: boolean = false,
    fields: any = [],
  ) {
    return this.getResponce(
      await lastValueFrom(
        this.httpService
          .post(
            this.url,
            {
              query: this.query(tableName, item, onlyFields, update, fields),
            },
            {
              headers: {
                'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET,
                'Content-Type': 'application/json',
              },
            },
          )
          .pipe(map((res) => res.data)),
      ),
      tableName,
    );
  }

  async qM(tableName: String, item: any, fields: any, onlyFields: any = []) {
    return this.getResponce(
      await lastValueFrom(
        this.httpService
          .post(
            this.url,
            {
              query: this.queryMulti(tableName, item, fields, onlyFields),
            },
            {
              headers: {
                'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET,
                'Content-Type': 'application/json',
              },
            },
          )
          .pipe(map((res) => res.data)),
      ),
      tableName,
    );
  }

  public getResponce = (
    { data, errors }: any,
    tableName: any,
    response = 'table',
  ) => {
    let result = null;
    if (data) {
      if (data[`insert_${tableName}_one`]) {
        result = data[`insert_${tableName}_one`];
      } else if (data[`update_${tableName}`]) {
        result = data[`update_${tableName}`];
      } else if (data[`delete_${tableName}`]) {
        result = data[`delete_${tableName}`];
      } else {
        result = data[tableName];
      }
    }
    result = result ? result : errors ? errors[0] : {};
    if (response === 'data') {
      return result;
    } else {
      return { [tableName]: result };
    }
  };
}

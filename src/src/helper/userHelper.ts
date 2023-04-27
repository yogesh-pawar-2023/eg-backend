import { Injectable } from '@nestjs/common';

@Injectable()
export class UserHelper {
  // generateRandomPassword
  public generateRandomPassword() {
    var length = 8,
      charset =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      password_value = '';
    for (var i = 0, n = charset.length; i < length; ++i) {
      password_value += charset.charAt(Math.floor(Math.random() * n));
    }
    return password_value;
  }

  public async getAdminKeycloakToken() {
    var axios = require('axios');
    var data = {
      username: 'admin',
      client_id: 'admin-cli',
      grant_type: 'client_credentials',
      password: process.env.KEYCLOAK_ADMIN_PASSWORD,
      client_secret: process.env.KEYCLOAK_ADMIN_CLI_CLIENT_SECRET,
    };
    var config = {
      method: 'post',
      url: `${process.env.KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: data,
    };

    return axios(config);
  }
}

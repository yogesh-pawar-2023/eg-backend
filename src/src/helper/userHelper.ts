import { Injectable } from "@nestjs/common";

@Injectable()
export class UserHelper {
public generateRandomPassword() {
    var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        password_value = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        password_value += charset.charAt(Math.floor(Math.random() * n));
    }
    return password_value;
}
}
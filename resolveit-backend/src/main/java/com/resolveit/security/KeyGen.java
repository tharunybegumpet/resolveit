package com.resolveit.security;


import io.jsonwebtoken.io.Encoders;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;

public class KeyGen {
    public static void main(String[] args) throws Exception {
        KeyGenerator keyGen = KeyGenerator.getInstance("HmacSHA256");
        SecretKey key = keyGen.generateKey();
        String base64Key = Encoders.BASE64.encode(key.getEncoded());
        System.out.println(base64Key);
    }
}
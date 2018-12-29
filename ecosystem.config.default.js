module.exports = {
  apps: [
    {
      name: "mydesktop",
      script: "./bin/www",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        // Domain Controller
        DC_PRIMARY_DNS: "",
        DC_SECONDARY_DNS: "",
        DOMAIN: "",
        NETBIOS: "",
        OU_PATH: "",
        MHUSER_PASS: "",
        // SSL Certificate
        CERT_PATH: "",
        CERT_PASSPHRASE: "",
        //  Active Directory
        LDAP_SERVER_URL: "",
        AD_ADMIN_USER: "",
        AD_ADMIN_PASS: "",
        ADMIN_GROUP: "",
        USER_GROUP: "",
        //  Database connection
        DB_HOST: "localhost",
        DB_PORT: 3306,
        DB_USER: "",
        DB_PASS: "",
        DB_DBNAME: "",
        // Session key
        SESSION_SECRET: "",
        // Alibaba cloud variables
        ALICLOUD_ACCESS_KEY_ID: "",
        ALICLOUD_SECRET_ACCESS_KEY: "",
        ALICLOUD_ENDPOINT: "",
        // Instance options
        REGION_ID: "",
        IMAGE_ID: "",
        INSTANCE_TYPE: "",
        INSTANCE_CHARGE_TYPE: "",
        PERIOD: "",
        VSWITCH_ID: "",
        SECURITY_GROUP_ID: ""

      }
    }
  ]
}
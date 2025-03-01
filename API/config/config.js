module.exports={
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    node_env:process.env.NODE_ENV,
    port:process.env.PORT,
    jwtsecret:process.env.JWT_SECRET,
    supaconnectionstring:process.env.SUPABASE_CONNECTION_STRING
}
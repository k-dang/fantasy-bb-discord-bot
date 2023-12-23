const { query } = require('./index');

/**
 * Upserts the encrypted access token & refresh token into the Authentication table
 * @param {string} encryptedToken - encrypted access token
 * @param {string} encryptedRefreshToken - encrypted refresh token
 * @returns {Promise<Object>} Authentication record
 */
const upsertAuthentication = async (encryptedToken, encryptedRefreshToken) => {
  try {
    await query('BEGIN');
    const upsertQuery = `
    INSERT INTO public."Authentication" (user_id, encrypted_token, encrypted_refresh_token, created_at, updated_at) 
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (user_id)
    DO UPDATE SET encrypted_token = $2, encrypted_refresh_token = $3, updated_at = $5
    RETURNING *`;

    const values = [
      1,
      encryptedToken,
      encryptedRefreshToken,
      new Date().toISOString(),
      new Date().toISOString(),
    ];

    const res = await query(upsertQuery, values);
    await query('COMMIT');
    return res.rows[0];
  } catch (e) {
    await query('ROLLBACK');
    throw e;
  }
};

const getAuthentication = async () => {
  try {
    const getQuery = 'SELECT * FROM public."Authentication"';
    const res = await query(getQuery);

    if (res.rows.length === 0) {
      return null;
    }

    return res.rows[0];
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = { upsertAuthentication, getAuthentication };

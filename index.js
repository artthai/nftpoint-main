const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/get_redeemable_point', async (req, res) => {
  try {
    const walletNames = req.body.wallet_names.split('\n').filter(Boolean);

    const redeemablePoints = await Promise.all(
      walletNames.map(async (walletName) => {
        const fetchConfig = {
          json: true,
          code: 'uspts.worlds',
          scope: 'uspts.worlds',
          table: 'userpoints',
          lower_bound: walletName,
          upper_bound: walletName,
          index_position: 1,
          key_type: '',
          limit: 1,
          reverse: false,
          show_payer: false,
        };

        const axiosConfig = {
          method: 'POST',
          url: 'https://wax.greymass.com/v1/chain/get_table_rows',
          headers: {},
          data: fetchConfig,
        };

        const response = await axios(axiosConfig);
        const redeemablePoint = response.data.rows[0]?.redeemable_point || null;

        return { walletName, redeemablePoint };
      })
    );

    res.json({ redeemablePoints });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

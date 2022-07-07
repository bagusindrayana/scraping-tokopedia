### Run
- `node app.js`
- buka url `http://localhost:3000/?q=laptop`
- demo url `https://sleepy-cliffs-98818.herokuapp.com/?q=handphone&pmin=1000000`

### Response
- Success
```json
[
    {
        "nama":"-",
        "harga":"Rp",
        "link":"https"
    }
]
```

- Error
```json
{
    "error":"-",
}
```


### Params

semua parameter filter di tokopedia bisa di terapkan

- `q` cari
- `pmin` harga minimum
- `pmax` harga maksimum
- `shop_tier` jenis toko
- `fcity` lokasi
- `page` halaman
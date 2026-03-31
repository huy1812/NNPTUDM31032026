var express = require('express');
var router = express.Router();
let inventoryModel = require('../schemas/Inventory');


router.get('/', async function (req, res, next) {
    try {
        let items = await inventoryModel.find().populate('product');
        res.send(items);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});


router.get('/:id', async function (req, res, next) {
    try {
        let item = await inventoryModel.findById(req.params.id).populate('product');
        if (item) {
            res.send(item);
        } else {
            res.status(404).send({ message: "Inventory not found" });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});


router.post('/add_stock', async function (req, res, next) {
    try {
        let { product, quantity } = req.body;
        if (!product || !quantity) {
            return res.status(400).send({ message: "Thiếu product ID hoặc quantity." });
        }

        let item = await inventoryModel.findOne({ product: product });
        if (item) {
            item.stock += Number(quantity);
            await item.save();
            res.send(item);
        } else {
            res.status(404).send({ message: "Inventory not found for this product" });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});


router.post('/remove_stock', async function (req, res, next) {
    try {
        let { product, quantity } = req.body;
        if (!product || !quantity) {
            return res.status(400).send({ message: "Thiếu product ID hoặc quantity." });
        }

        let item = await inventoryModel.findOne({ product: product });
        if (!item) {
            return res.status(404).send({ message: "Inventory not found for this product" });
        }

        if (item.stock < quantity) {
            return res.status(400).send({ message: "Không đủ số lượng tồn kho (stock) để giảm." });
        }

        item.stock -= Number(quantity);
        await item.save();
        res.send(item);

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});


router.post('/reservation', async function (req, res, next) {
    try {
        let { product, quantity } = req.body;
        if (!product || !quantity) {
            return res.status(400).send({ message: "Thiếu product ID hoặc quantity." });
        }

        let item = await inventoryModel.findOne({ product: product });
        if (!item) {
            return res.status(404).send({ message: "Inventory not found for this product" });
        }

        if (item.stock < quantity) {
            return res.status(400).send({ message: "Không đủ số lượng trong kho (stock) để giữ hàng (reserve)." });
        }

        item.stock -= Number(quantity);
        item.reserved += Number(quantity);
        await item.save();
        res.send(item);

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

router.post('/sold', async function (req, res, next) {
    try {
        let { product, quantity } = req.body;
        if (!product || !quantity) {
            return res.status(400).send({ message: "Thiếu product ID hoặc quantity." });
        }

        let item = await inventoryModel.findOne({ product: product });
        if (!item) {
            return res.status(404).send({ message: "Inventory not found for this product" });
        }

        if (item.reserved < quantity) {
            return res.status(400).send({ message: "Không đủ số hàng đang giữ (reserved) để xuất bán (sold)." });
        }

        item.reserved -= Number(quantity);
        item.soldCount += Number(quantity);
        await item.save();
        res.send(item);

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;
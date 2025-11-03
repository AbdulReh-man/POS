-- TRIGGERS: maintain live stock in products + audit in stock_movements

-- When purchase_items inserted => increase product.stock
CREATE TRIGGER IF NOT EXISTS trg_purchase_items_after_insert
AFTER INSERT ON purchase_items
BEGIN
  UPDATE products
    SET stock = COALESCE(stock,0) + NEW.quantity,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.product_id;

  INSERT INTO stock_movements(product_id, change, reference_type, reference_id, note)
    VALUES (NEW.product_id, NEW.quantity, 'purchase', NEW.purchase_id, 'purchase item added');
END;


-- When purchase_items deleted => decrease product.stock
CREATE TRIGGER IF NOT EXISTS trg_purchase_items_after_delete
AFTER DELETE ON purchase_items
BEGIN
  UPDATE products
    SET stock = COALESCE(stock,0) - OLD.quantity,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.product_id;

  INSERT INTO stock_movements(product_id, change, reference_type, reference_id, note)
    VALUES (OLD.product_id, -OLD.quantity, 'purchase_delete', OLD.purchase_id, 'purchase item deleted');
END;


-- When purchase_items updated => apply delta
CREATE TRIGGER IF NOT EXISTS trg_purchase_items_after_update
AFTER UPDATE ON purchase_items
BEGIN
  UPDATE products
    SET stock = COALESCE(stock,0) + (NEW.quantity - OLD.quantity),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.product_id;

  INSERT INTO stock_movements(product_id, change, reference_type, reference_id, note)
    VALUES (NEW.product_id, (NEW.quantity - OLD.quantity), 'purchase_update', NEW.purchase_id, 'purchase item updated');
END;


-- When sale_items inserted => decrease product.stock
CREATE TRIGGER IF NOT EXISTS trg_sale_items_after_insert
AFTER INSERT ON sale_items
BEGIN
  UPDATE products
    SET stock = COALESCE(stock,0) - NEW.quantity,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.product_id;

  INSERT INTO stock_movements(product_id, change, reference_type, reference_id, note)
    VALUES (NEW.product_id, -NEW.quantity, 'sale', NEW.sale_id, 'sale item added');
END;


-- When sale_items deleted => increase product.stock
CREATE TRIGGER IF NOT EXISTS trg_sale_items_after_delete
AFTER DELETE ON sale_items
BEGIN
  UPDATE products
    SET stock = COALESCE(stock,0) + OLD.quantity,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.product_id;

  INSERT INTO stock_movements(product_id, change, reference_type, reference_id, note)
    VALUES (OLD.product_id, OLD.quantity, 'sale_delete', OLD.sale_id, 'sale item deleted');
END;


-- When sale_items updated => apply delta
CREATE TRIGGER IF NOT EXISTS trg_sale_items_after_update
AFTER UPDATE ON sale_items
BEGIN
  UPDATE products
    SET stock = COALESCE(stock,0) - (NEW.quantity - OLD.quantity),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.product_id;

  INSERT INTO stock_movements(product_id, change, reference_type, reference_id, note)
    VALUES (NEW.product_id, -(NEW.quantity - OLD.quantity), 'sale_update', NEW.sale_id, 'sale item updated');
END;

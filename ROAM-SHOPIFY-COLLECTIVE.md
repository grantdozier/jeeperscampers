# ROAM Products Through Shopify Collective

ROAM confirmed that Shopify Collective is its supported dealer integration. Do not hard-code dealer cost, inventory, variants, or sale prices into this React site as the long-term solution.

## Prerequisites

- An active Shopify store on an eligible paid plan
- Shopify Payments activated
- The store country and currency compatible with ROAM's store
- A staff account authorized to install apps, manage products, and configure markets and shipping
- ROAM's supplier contact or invitation

Shopify Collective is not available on ordinary development or client-transfer stores.

## Connect to ROAM

1. In Shopify admin, install **Shopify Collective: Retailer**.
2. Open **Apps → Collective → Suppliers**.
3. Search Discovery for ROAM. If ROAM is not publicly available, choose **Invite supplier** and use the wholesale contact that replied to the dealer email.
4. Ask ROAM to share its dealer price list for:

   - Vagabond 2.0 Rooftop Tent
   - Vagabond XL 2.0 Rooftop Tent
   - Desperado Hardshell Rooftop Tent
   - Any approved racks, mounts, annexes, awnings, shower rooms, or water products

5. After ROAM accepts, review retailer cost, retail price, margin, shipping, return policy, variants, and availability before importing.

## Import policy

Start conservatively:

1. Set import method to **Manual**.
2. Import products as **Draft**.
3. Synchronize inventory, compare-at price, retail price, title, description, media, SKU, barcode, weight, and variants.
4. Set unavailable products to inventory zero rather than deleting them.
5. Review ROAM shipping and return policies.
6. Keep discount codes from reducing margin below the supplier cost.
7. Publish only approved products after a test order.

After successful fulfillment testing, automatic imports can be considered.

## Website integration decision

The current Badland Campers site is React on GitHub Pages, not a Shopify storefront. Choose one of these paths:

### Recommended: keep camper checkout separate

- Keep camper builds and deposits in the existing Stripe checkout.
- Add a **Shop ROAM Gear** link to the Shopify storefront or Buy Button sales channel.
- Let Shopify Collective handle ROAM inventory, variants, supplier payment, shipping, fulfillment, returns, and price synchronization.
- Do not combine a custom camper deposit and a Collective product in one Stripe transaction.

### Alternative: move the entire storefront to Shopify

Use this only if one unified cart is more important than the current custom builder. It requires rebuilding the camper configuration and deposit workflow inside Shopify.

## Rooftop-tent pricing used before Collective

The builder currently uses ROAM's regular retail prices verified on July 17, 2026:

- Vagabond 2.0: $2,399
- Vagabond XL 2.0: $2,749
- Desperado Hardshell: $3,199

These are fallback display prices, not dealer costs. Temporary sale prices are intentionally ignored. Once Collective is connected, review whether rooftop tents should be removed from the camper Stripe total and sold through Shopify instead.

## Acceptance test

1. Import one ROAM product as Draft.
2. Verify images, variants, price, supplier cost, margin, inventory, weight, and shipping.
3. Publish it to a test-visible Shopify channel.
4. Place a test order using Shopify's supported test-payment mode.
5. Confirm the order reaches ROAM, inventory syncs, tracking returns to Shopify, and customer notifications use the correct brand.
6. Test cancellation and return handling before publishing the full collection.

Official references:

- https://help.shopify.com/en/manual/online-sales-channels/shopify-collective/retailers
- https://help.shopify.com/en/manual/online-sales-channels/shopify-collective/retailers/importing-products
- https://help.shopify.com/en/manual/online-sales-channels/shopify-collective/retailers/policies/products
- https://www.roamadventureco.com/collections/tents

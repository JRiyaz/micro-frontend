I've user-service, shell, and inventory modules. each of it is a microservice. inventory has many features like payments, orders, inventory, products and etc. all these are admin dashboards.

I want a user facing store module with following features in store-service. This should be a independent microservice. that can be used by other services.

1. user can see the avalible items
2. search for iteams
3. filter iteam with different catogeries, prices and etc. 4. User can view product details going into prodcut page.
4. User can add iteams to cart, modify cart iteams.
5. can proceed to pay for the iteams
6. should be able to tract orders
7. Should have an option to oprn cancel request for the items from the order
8. User can view the dashboard without login, but to add items to cart and view order and other user should have been logged in, it should redirect to login page

NOTE: Inventory service is already existing, but it is not having the user facing dashboard. so, i want you to create a new service called store-service that will have the user facing dashboard. and it should use the inventory service for the data. and user-service for the authentication. Also, this application has dark and theam support, make sure to support both in new screens. And don't add any extra scripts or extra libraries, use the existing libraries and frameworks. Use the exisiting folder structures and code style.

IMPORTANT: Write only reusable code (styles, htmls, and etc). each service should be independent and should be able to run independently. and use the common libraries. All the screens should be responsive and should work on mobile devices.

If anything is missing or unclear, ask me for clarification. Suggest me best practices and solutions.

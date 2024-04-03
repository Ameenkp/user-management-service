import { curry, defaultTo } from "ramda";
import {UserManagementServiceConstants} from "./userManagementServiceConstants";

const orDefaultRegion = defaultTo(UserManagementServiceConstants.USER_MANAGEMENT_SERVICE_DEFAULT_REGION);
const createClientForRegion = curry(
    (region, ClientConstructor) =>
        new ClientConstructor({ region: orDefaultRegion(region) })
);
const createClientForDefaultRegion = createClientForRegion(null);
export {
    createClientForDefaultRegion,
    createClientForRegion,
    orDefaultRegion,
};
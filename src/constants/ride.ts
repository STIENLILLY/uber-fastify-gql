import { registerEnumType } from 'type-graphql';

export enum RideStatus {
    ACCEPTED,
    FINISHED,
    CANCELED,
    REQUESTING,
    ONROUTE,
}

export enum DriverRider {
    PASSENGER,
    DRIVER,
}

export const DRIVER_MODE = `MODE:${DriverRider.DRIVER}`;
export const PASSENGER_MODE = `MODE:${DriverRider.PASSENGER}`;

registerEnumType(RideStatus, {
    name: 'RideStatus',
});

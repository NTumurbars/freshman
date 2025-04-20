import {
    BuildingOffice2Icon,
    BuildingStorefrontIcon,
    ChevronRightIcon,
    PlusIcon,
} from '@heroicons/react/24/outline';
import { Head, Link } from '@inertiajs/react';
import {
    Button,
    Card,
    Col,
    Grid,
    Icon,
    Metric,
    Text,
    Title,
} from '@tremor/react';
import AppLayout from '@/Layouts/AppLayout';

const BuildingCard = ({ building }) => (
    <Card>
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
                <Icon
                    icon={BuildingOffice2Icon}
                    variant="solid"
                    size="lg"
                    color="blue"
                />
                <div>
                    <Title>{building.name}</Title>
                    <Text className="mt-1">Building ID: {building.id}</Text>
                </div>
            </div>
        </div>

        <Grid numItems={1} numItemsSm={2} className="mt-6 gap-6">
            <Card decoration="top" decorationColor="indigo">
                <div className="flex items-center justify-between">
                    <Text>Floors</Text>
                    <BuildingStorefrontIcon className="h-5 w-5 text-indigo-500" />
                </div>
                <Metric>{building.stats.floors}</Metric>
            </Card>
            <Card decoration="top" decorationColor="cyan">
                <div className="flex items-center justify-between">
                    <Text>Total Rooms</Text>
                    <BuildingStorefrontIcon className="h-5 w-5 text-cyan-500" />
                </div>
                <Metric>{building.stats.rooms}</Metric>
            </Card>
        </Grid>

        <div className="mt-6 flex items-center justify-end gap-2">
            <Link
                href={route('buildings.show', {
                    school: building.school_id,
                    building: building.id,
                })}
            >
                <Button variant="light" color="gray" icon={ChevronRightIcon} className='flex items-center pr-2'>
                    View Details
                </Button>
            </Link>
            <Link
                href={route('buildings.floors.index', {
                    school: building.school_id,
                    building: building.id,
                })}
            >
                <Button variant="secondary">Manage Floors</Button>
            </Link>
        </div>
    </Card>
);

export default function Index({ buildings, school, can_create }) {
    return (
        <AppLayout>
            <Head title="Buildings" />

            <div className="px-4 py-6 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <Title>Buildings</Title>
                        <Text>Manage campus buildings for {school.name}</Text>
                    </div>
                    {can_create && (
                        <Link href={route('buildings.create', school.id)}>
                            <Button icon={PlusIcon}>Add Building</Button>
                        </Link>
                    )}
                </div>

                <div className="mt-6">
                    {buildings.length === 0 ? (
                        <Card>
                            <div className="flex flex-col items-center justify-center py-12">
                                <BuildingOffice2Icon className="h-12 w-12 text-gray-400" />
                                <Text className="mt-2">No buildings found</Text>
                                {can_create && (
                                    <Link
                                        href={route(
                                            'buildings.create',
                                            school.id,
                                        )}
                                        className="mt-4"
                                    >
                                        <Button variant="light" icon={PlusIcon}>
                                            Add your first building
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </Card>
                    ) : (
                        <Grid
                            numItems={1}
                            numItemsSm={2}
                            numItemsLg={3}
                            className="gap-6"
                        >
                            {buildings.map((building) => (
                                <Col key={building.id}>
                                    <BuildingCard building={building} />
                                </Col>
                            ))}
                        </Grid>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

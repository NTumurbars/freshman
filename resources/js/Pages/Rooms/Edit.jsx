import AppLayout from '@/Layouts/AppLayout';
import {
    ArrowLeftIcon,
    BuildingOffice2Icon,
    HomeModernIcon,
} from '@heroicons/react/24/outline';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    Button,
    Card,
    Divider,
    Flex,
    MultiSelect,
    MultiSelectItem,
    NumberInput,
    Select,
    SelectItem,
    Text,
    TextInput,
    Title,
} from '@tremor/react';
import { useEffect, useState } from 'react';

export default function Edit({ room, floors, features, returnUrl }) {
    const { auth } = usePage().props;
    const school = auth.user.school;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [buildings, setBuildings] = useState([]);
    const [buildingFloors, setBuildingFloors] = useState([]);
    const [selectedBuilding, setSelectedBuilding] = useState('');

    // Convert feature_ids to strings for MultiSelect
    const initialFeatureIds = (room.features || []).map((f) => f.id.toString());

    const { data, setData, put, processing, errors } = useForm({
        room_number: room.room_number || '',
        floor_id: room.floor_id ? room.floor_id.toString() : '',
        capacity: room.capacity || 30,
        feature_ids: initialFeatureIds,
        return_url: returnUrl || '',
    });

    // Group floors by buildings
    useEffect(() => {
        const buildingsMap = new Map();

        floors.forEach((floor) => {
            const building = floor.building;
            if (building) {
                if (!buildingsMap.has(building.id)) {
                    buildingsMap.set(building.id, {
                        id: building.id,
                        name: building.name,
                        school_id: building.school_id,
                    });
                }
            }
        });

        setBuildings(Array.from(buildingsMap.values()));

        // Set the initial building based on room's floor
        if (room.floor && room.floor.building) {
            const buildingId = room.floor.building.id.toString();
            setSelectedBuilding(buildingId);
            updateBuildingFloors(buildingId);
        }
    }, [floors, room]);

    const updateBuildingFloors = (buildingId) => {
        const filteredFloors = floors.filter(
            (floor) =>
                floor.building && floor.building.id.toString() === buildingId,
        );
        setBuildingFloors(filteredFloors);
    };

    const handleBuildingChange = (buildingId) => {
        setSelectedBuilding(buildingId);
        setData('floor_id', ''); // Reset floor when building changes
        updateBuildingFloors(buildingId);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        put(
            route('rooms.update', {
                school: school.id,
                room: room.id,
            }),
            {
                onSuccess: () => {
                    setIsSubmitting(false);

                    if (data.return_url) {
                        window.location.href = data.return_url;
                    }
                },
                onError: () => {
                    setIsSubmitting(false);
                },
            },
        );
    };

    return (
        <AppLayout>
            <Head title={`Edit Room - ${room.room_number}`} />

            <div className="px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-6 sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center">
                        <Link
                            href={
                                returnUrl ||
                                route('rooms.index', { school: school.id })
                            }
                        >
                            <Button
                                variant="light"
                                color="gray"
                                icon={ArrowLeftIcon}
                                className="mr-4"
                            >
                                Back
                            </Button>
                        </Link>
                        <div className="flex items-center">
                            <HomeModernIcon className="mr-3 h-8 w-8 text-blue-600" />
                            <div>
                                <Title>Edit Room</Title>
                                <Text>{room.name || room.room_number}</Text>
                            </div>
                        </div>
                    </div>
                </div>

                <Card>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            <div>
                                <Text>Room Information</Text>
                                <Divider className="my-2" />

                                <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <Text>Room Number/Name</Text>
                                        <TextInput
                                            value={data.room_number}
                                            onChange={(e) =>
                                                setData(
                                                    'room_number',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Enter room number or name (e.g. 101, Lab A)"
                                            className="mt-1"
                                            error={!!errors.room_number}
                                            errorMessage={errors.room_number}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Text>Capacity</Text>
                                        <NumberInput
                                            value={data.capacity}
                                            onValueChange={(value) =>
                                                setData('capacity', value)
                                            }
                                            placeholder="Enter room capacity"
                                            className="mt-1"
                                            error={!!errors.capacity}
                                            errorMessage={errors.capacity}
                                            min={1}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Text>Location</Text>
                                <Divider className="my-2" />

                                <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <Text>Building</Text>
                                        <Select
                                            value={selectedBuilding}
                                            onValueChange={handleBuildingChange}
                                            placeholder="Select a building"
                                            className="mt-1"
                                            icon={BuildingOffice2Icon}
                                            required
                                        >
                                            {buildings.map((building) => (
                                                <SelectItem
                                                    key={building.id}
                                                    value={building.id.toString()}
                                                >
                                                    {building.name}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    </div>

                                    <div>
                                        <Text>Floor</Text>
                                        <Select
                                            value={data.floor_id}
                                            onValueChange={(value) =>
                                                setData('floor_id', value)
                                            }
                                            placeholder="Select a floor"
                                            className="mt-1"
                                            error={!!errors.floor_id}
                                            errorMessage={errors.floor_id}
                                            disabled={!selectedBuilding}
                                            required
                                        >
                                            {buildingFloors.map((floor) => (
                                                <SelectItem
                                                    key={floor.id}
                                                    value={floor.id.toString()}
                                                >
                                                    {floor.name}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Text>Features & Equipment</Text>
                                <Divider className="my-2" />

                                <div className="mt-4">
                                    <Text>Room Features</Text>
                                    <MultiSelect
                                        value={data.feature_ids}
                                        onValueChange={(values) =>
                                            setData('feature_ids', values)
                                        }
                                        placeholder="Select room features"
                                        className="mt-1"
                                    >
                                        {features.map((feature) => (
                                            <MultiSelectItem
                                                key={feature.id}
                                                value={feature.id.toString()}
                                            >
                                                {feature.name}
                                            </MultiSelectItem>
                                        ))}
                                    </MultiSelect>
                                    <Text className="mt-1 text-sm text-gray-500">
                                        Select all equipment and features
                                        available in this room
                                    </Text>
                                </div>
                            </div>
                        </div>

                        <Divider className="my-6" />

                        <Flex justifyContent="end">
                            <Button
                                type="submit"
                                loading={isSubmitting || processing}
                            >
                                Update Room
                            </Button>
                        </Flex>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}

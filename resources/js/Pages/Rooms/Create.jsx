import AppLayout from '@/Layouts/AppLayout';
import {
    ArrowLeftIcon,
    BuildingOffice2Icon,
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
import { DoorOpen } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Create({
    floors,
    features,
    selectedFloorId,
    returnUrl,
    preselectedFloor,
    preselectedBuilding,
}) {
    const { auth } = usePage().props;
    const school = auth.user.school;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [buildings, setBuildings] = useState([]);
    const [buildingFloors, setBuildingFloors] = useState([]);
    const [selectedBuilding, setSelectedBuilding] = useState('');
    const [comingFromFloor, setComingFromFloor] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        room_number: '',
        floor_id: selectedFloorId || '',
        capacity: 30,
        feature_ids: [],
        return_url: returnUrl || '',
    });

    // Use preselected floor and building data if available
    useEffect(() => {
        if (preselectedFloor && preselectedBuilding) {
            setComingFromFloor(true);
            setSelectedBuilding(preselectedBuilding.id.toString());
            setData('floor_id', preselectedFloor.id.toString());

            // Set building floors right away
            const filteredFloors = floors.filter(
                (floor) =>
                    floor.building &&
                    floor.building.id === preselectedBuilding.id,
            );
            setBuildingFloors(filteredFloors);
        }
    }, [preselectedFloor, preselectedBuilding]);

    // Group floors by buildings
    useEffect(() => {
        const buildingsMap = new Map();

        // Check URL for floor_id directly
        const urlParams = new URLSearchParams(window.location.search);
        const urlFloorId = urlParams.get('floor_id');

        // Use either the prop or URL parameter
        const effectiveFloorId = selectedFloorId || urlFloorId;

        console.log('Create room parameters:', {
            'selectedFloorId from props': selectedFloorId,
            'urlFloorId from URL': urlFloorId,
            'effective floor ID': effectiveFloorId,
            type: typeof effectiveFloorId,
        });

        console.log('All floors:', floors);

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

        // If selectedFloorId is provided, select the corresponding building
        if (effectiveFloorId) {
            const parsedFloorId = parseInt(effectiveFloorId, 10);
            console.log('Parsed floor ID:', parsedFloorId);

            setComingFromFloor(true);
            const floor = floors.find((f) => f.id === parsedFloorId);
            console.log('Found floor:', floor);

            if (floor && floor.building) {
                console.log('Setting building to:', floor.building.name);
                setSelectedBuilding(floor.building.id.toString());
                updateBuildingFloors(floor.building.id.toString());

                // Also set the floor_id in the form data if it wasn't already set
                if (data.floor_id !== effectiveFloorId) {
                    setData('floor_id', effectiveFloorId);
                }
            } else {
                console.error('Could not find floor with ID:', parsedFloorId);
                console.log(
                    'Available floors IDs:',
                    floors.map((f) => f.id),
                );
            }
        } else {
            console.log(
                'No floor ID provided, user is creating a room from scratch',
            );
        }
    }, [floors, selectedFloorId, window.location.search]);

    // Additional fallback - check localStorage
    useEffect(() => {
        if (
            !selectedFloorId &&
            !preselectedFloor &&
            typeof localStorage !== 'undefined'
        ) {
            const storedFloorId = localStorage.getItem('lastSelectedFloorId');
            if (storedFloorId) {
                console.log(
                    'Fallback: Found floor ID in localStorage:',
                    storedFloorId,
                );

                // Find the floor
                const floor = floors.find(
                    (f) => f.id === parseInt(storedFloorId, 10),
                );
                if (floor && floor.building) {
                    console.log(
                        'Fallback: Found floor and building from localStorage',
                    );
                    setComingFromFloor(true);
                    setSelectedBuilding(floor.building.id.toString());
                    setData('floor_id', storedFloorId);

                    // Also update the building floors
                    const filteredFloors = floors.filter(
                        (f) =>
                            f.building && f.building.id === floor.building.id,
                    );
                    setBuildingFloors(filteredFloors);
                }
            }
        }
    }, [floors, selectedFloorId, preselectedFloor]);

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

        post(route('rooms.store', { school: school.id }), {
            onSuccess: () => {
                setIsSubmitting(false);
            },
            onError: () => {
                setIsSubmitting(false);
            },
        });
    };

    // For debugging raw URL parameters
    useEffect(() => {
        // Check URL for floor_id directly
        const urlParams = new URLSearchParams(window.location.search);
        const urlFloorId = urlParams.get('floor_id');
        console.log('URL parameters:', {
            urlFloorId: urlFloorId,
            selectedFloorId: selectedFloorId,
            full_url: window.location.href,
        });
    }, []);

    return (
        <AppLayout>
            <Head title="Add New Room" />

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
                            <DoorOpen className="mr-3 h-8 w-8 text-blue-600" />
                            <div>
                                <Title>Add New Room</Title>
                                <Text>Create a room in a building floor</Text>
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
                                            disabled={comingFromFloor}
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
                                        {comingFromFloor && (
                                            <Text className="mt-1 text-xs text-gray-500">
                                                Building is pre-selected based
                                                on the floor you came from
                                            </Text>
                                        )}
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
                                            disabled={
                                                !selectedBuilding ||
                                                comingFromFloor
                                            }
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
                                        {comingFromFloor && (
                                            <Text className="mt-1 text-xs text-gray-500">
                                                Floor is pre-selected based on
                                                where you came from
                                            </Text>
                                        )}
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
                                Create Room
                            </Button>
                        </Flex>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}

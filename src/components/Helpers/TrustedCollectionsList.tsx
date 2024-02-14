import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { shortenAddress } from '../../services/utils/shorten';
import TrustedCollectionItem from './TrustedCollectionItem';


function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

interface CollectionData {
    collectionAddress: string;
    enrolled: boolean;
}

export default function TrustedCollectionList(props: {collection: CollectionData[] | null | undefined, onCollectionChange: (collection: string) => void }) {
    const collection = props.collection as CollectionData[] | null | undefined;
    const [selectedCollection, setSelectedCollection] = useState<string | null>("Select...");
    const handleChange = (collection: string) => {
        props.onCollectionChange(collection);
        setSelectedCollection(collection);
    }
    return (
        <>
        {collection && collection?.length > 0 ? 
        <Listbox value={selectedCollection} onChange={handleChange}>
            {({ open }) => (
            <>
                <div className="relative">
                <Listbox.Button className="relative w-full border border-gray-500 cursor-default py-1.5 pl-3 pr-10 text-left text-gray-200 sm:text-sm sm:leading-6">
                    <span className="block truncate">{selectedCollection != 'Select...' ? shortenAddress(selectedCollection) : selectedCollection}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                </Listbox.Button>

                <Transition
                    show={open}
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {collection.map((item, index) => (
                        <Listbox.Option
                        key={index}
                        className={({ active }) =>
                            classNames(
                            active ? 'bg-gray-200 text-white' : 'text-gray-900',
                            'relative cursor-default select-none py-2 pl-3 pr-9'
                            )
                        }
                        value={item.collectionAddress}
                        >
                        {({ selected, active }) => (
                            <>
                            <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                                <TrustedCollectionItem address={item.collectionAddress} tokenId={1} />
                            </span>

                            {selected ? (
                                <span
                                className={classNames(
                                    active ? 'text-white' : 'text-indigo-600',
                                    'absolute inset-y-0 right-0 flex items-center pr-4'
                                )}
                                >
                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                </span>
                            ) : null}
                            </>
                        )}
                        </Listbox.Option>
                    ))}
                    </Listbox.Options>
                </Transition>
                </div>
            </>
            )}
        </Listbox>
        : <div className='text-gray-400'>Loading...</div>}
    </>
    );
}
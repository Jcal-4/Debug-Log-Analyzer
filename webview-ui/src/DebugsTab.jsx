/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    addToast,
    ToastProvider,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Button
} from "@heroui/react";

const DebugsTab = ({ flattenedData, setSelectedTab, scrollToElement, highlightSearchTerm, searchTerm }) => {
    const [userDebugs, setUserDebugs] = useState([]);
    useEffect(() => {
        console.log("flattenedData: ", flattenedData);
        let userDebugs = [];
        if (flattenedData) {
            flattenedData.forEach((element) => {
                if (element.isUserDebug || element.isException) {
                    if (element.isException) {
                        console.log("elementException: ", element);
                    }
                    // Extract the value inside parentheses
                    const match = element.event.match(/\[([^\]]+)\]/);
                    if (match) {
                        userDebugs.push({
                            event: match[1],
                            value: element.value, // The value inside parentheses
                            isUserDebug: element.isUserDebug,
                            isException: element.isException,
                            index: element.index
                        });
                    }
                } else if (element.isFatalError) {
                    console.log("elementFatal: ", element);
                    userDebugs.push({
                        event: element.event,
                        value: element.value,
                        isFatalError: element.isFatalError,
                        index: element.index
                    });
                }
            });
            console.log("userDebugs: ", userDebugs);
            setUserDebugs(userDebugs);
        }
    }, [flattenedData]);

    const handleRedirectionClick = (index) => {
        console.log("index: ", index);
        setSelectedTab("analyzedDebugLogs");
        scrollToElement(index);
    };

    const handleCopyClick = (value) => {
        let description = "";
        if (value.length <= 68) {
            description = value;
        }

        navigator.clipboard.writeText(value).then(
            () => {
                addToast({
                    title: "Copied to clipboard",
                    description: description,
                    color: "success",
                    timeout: 4000,
                    shouldShowTimeoutProgress: true
                });
            },
            (err) => {
                console.error("Could not copy text: ", err);
            }
        );
    };

    return (
        <div className="userDebugs overflow-y-scroll h-[calc(100vh-49px)] px-0">
            <ToastProvider />
            {userDebugs && userDebugs.length > 0 ? (
                <Table
                    classNames={{
                        base: "max-w-full",
                        td: "max-w-[700px] break-words whitespace-normal", // Added word break and normal whitespace
                        th: "max-w-[75px]" // Added for header cells too
                    }}
                    className="rounded-none"
                    isStriped
                    aria-label="Example static collection table"
                    color="primary"
                >
                    <TableHeader>
                        <TableColumn width={100} className="font-bold">
                            Line #
                        </TableColumn>
                        <TableColumn width={100} className="font-bold">
                            Log Type
                        </TableColumn>
                        <TableColumn width={700} className="font-bold">
                            Debug Value
                        </TableColumn>
                        <TableColumn width={75} className="font-bold">
                            Actions
                        </TableColumn>
                    </TableHeader>
                    <TableBody emptyContent={"No debugs to display."}>
                        {userDebugs.map((item) => {
                            if (item.isUserDebug || item.isException) {
                                return (
                                    <TableRow key={item.index} data-key={item.index}>
                                        <TableCell className={`whitespace-nowrap font-bold align-top`}>{item.event}</TableCell>
                                        <TableCell
                                            className={`whitespace-nowrap ${item.isException ? "text-[#ed7c66]" : "text-[#5497c3]"} font-bold align-top`}
                                        >
                                            {item.isUserDebug ? "User Debug" : "Exception Thrown"}
                                        </TableCell>
                                        <TableCell className={`${item.isUserDebug ? "text-[#5497c3]" : "text-[#ed7c66]"} font-bold`}>
                                            {item.value}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap align-top">
                                            <div className="relative flex justify-end items-center gap-2">
                                                <Dropdown>
                                                    <DropdownTrigger>
                                                        <Button isIconOnly size="sm" variant="light">
                                                            <VerticalDotsIcon className="text-default-300" />
                                                        </Button>
                                                    </DropdownTrigger>
                                                    <DropdownMenu>
                                                        <DropdownItem
                                                            key="view"
                                                            onClick={() => {
                                                                handleCopyClick(item.value);
                                                            }}
                                                        >
                                                            Copy
                                                        </DropdownItem>
                                                        <DropdownItem
                                                            key="edit"
                                                            onClick={() => {
                                                                handleRedirectionClick(item.index);
                                                            }}
                                                        >
                                                            Go to Log Location
                                                        </DropdownItem>
                                                    </DropdownMenu>
                                                </Dropdown>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            } else if (item.isFatalError) {
                                return (
                                    <TableRow key={item.index} data-key={item.index}>
                                        <TableCell className="whitespace-nowrap text-[#ed7c66] font-bold align-top"></TableCell>
                                        <TableCell className="whitespace-nowrap text-[#ed7c66] font-bold align-top">Fatal Error</TableCell>
                                        <TableCell className="text-[#ed7c66] font-bold">{item.value}</TableCell>
                                        <TableCell>
                                            <div className="relative flex justify-end items-center gap-2">
                                                <Dropdown>
                                                    <DropdownTrigger>
                                                        <Button isIconOnly size="sm" variant="light">
                                                            <VerticalDotsIcon className="text-default-300" />
                                                        </Button>
                                                    </DropdownTrigger>
                                                    <DropdownMenu>
                                                        <DropdownItem
                                                            key="view"
                                                            onClick={() => {
                                                                handleCopyClick(item.value);
                                                            }}
                                                        >
                                                            Copy
                                                        </DropdownItem>
                                                        <DropdownItem
                                                            key="edit"
                                                            onClick={() => {
                                                                handleRedirectionClick(item.index);
                                                            }}
                                                        >
                                                            Go to Log Location
                                                        </DropdownItem>
                                                    </DropdownMenu>
                                                </Dropdown>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            }
                            return null;
                        })}
                    </TableBody>
                </Table>
            ) : (
                <div>
                    <Table aria-label="Example static collection table" color="primary" defaultSelectedKeys={["1"]} selectionMode="single">
                        <TableHeader>
                            <TableColumn>Apex Line</TableColumn>
                            <TableColumn>Debug Value</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent={"No debugs to display."}></TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
};

export const VerticalDotsIcon = ({ size = 24, width, height, ...props }) => {
    return (
        <svg
            aria-hidden="true"
            fill="none"
            focusable="false"
            height={size || height}
            role="presentation"
            viewBox="0 0 24 24"
            width={size || width}
            {...props}
        >
            <path
                d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                fill="currentColor"
            />
        </svg>
    );
};

export default DebugsTab;

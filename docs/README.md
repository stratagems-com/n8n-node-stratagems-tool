# 8kit n8n Node Documentation

This directory contains comprehensive documentation for all operations available in the 8kit n8n node.

## Set Operations

### Set Management
- **[Create Set](create-set.md)** - Creates a new empty set for tracking unique values
- **[List Sets](list-sets.md)** - Retrieves all sets available for your application with pagination
- **[Get Set Info](get-set-info.md)** - Retrieves detailed information about a specific set

### Set Values Management
- **[Add Value to Set](add-to-set.md)** - Adds a new value to an existing set
- **[Get Set Values](get-set-values.md)** - Retrieves all values stored in a specific set with pagination
- **[Remove Value from Set](remove-from-set.md)** - Removes a specific value from an existing set
- **[Check Set Values](check-set-values.md)** - Checks if a value exists in a set with dual output streams

## Lookup Operations

### Lookup Management
- **[Create Lookup](create-lookup.md)** - Creates a new lookup table for mapping between different ID systems
- **[List Lookups](list-lookups.md)** - Retrieves all lookup tables available for your application with pagination

### Lookup Values Management
- **[Add Mapping to Lookup](add-to-lookup.md)** - Creates ID mappings between two systems in a lookup table
- **[Get Lookup Values](get-lookup-values.md)** - Retrieves all mappings stored in a specific lookup table with pagination
- **[Remove Mapping from Lookup](remove-from-lookup.md)** - Removes a specific mapping from an existing lookup table

## Documentation Structure

Each operation documentation follows a consistent structure:

1. **Name** - Clear title and brief description
2. **Description** - Detailed explanation with use cases and scenarios
3. **Input** - Complete parameter specifications with validation rules
4. **Operation** - Technical details of how the operation works internally
5. **Output** - Response format and field descriptions
6. **Examples** - Practical usage examples with input/output pairs

## Common Features

All operations support:
- **Dynamic Input** - Using values from previous nodes in the workflow
- **Error Handling** - Comprehensive error scenarios and responses
- **Validation** - Input validation with clear error messages
- **Pagination** - Where applicable, operations support pagination for large datasets

## Getting Started

1. Choose the operation that fits your use case
2. Review the documentation for input requirements
3. Configure the operation in your n8n workflow
4. Test with the provided examples
5. Integrate into your automation workflows

## Support

For additional support or questions about the 8kit n8n node, please refer to the main project documentation or contact the development team. 